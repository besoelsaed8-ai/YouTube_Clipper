const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const TEMP_DIR = path.join(__dirname, '../../temp');
const upload = multer({
    dest: TEMP_DIR,
    limits: {
        fileSize: 400 * 1024 * 1024, // 400MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|ogg|mp3|wav|mkv|avi)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only video and audio files are allowed.'));
        }
    },
});

/**
 * POST /api/transcribe
 * Transcribe a video/audio file using Whisper
 * 
 * Body: multipart/form-data with 'video' field
 * Query: ?language=ar (optional)
 * 
 * Returns: { segments: [{start, end, text}], language, text }
 */
router.post('/', upload.single('video'), async (req, res) => {
    const tempFiles = [];

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const language = req.body.language || null;
        const modelSize = req.body.model || 'base';

        console.log(`[Transcribe] Request: ${req.file.originalname} (lang: ${language || 'auto'}, model: ${modelSize})`);

        // Rename file with proper extension
        const ext = path.extname(req.file.originalname) || '.mp4';
        const inputPath = path.join(TEMP_DIR, `transcribe_${uuidv4()}${ext}`);
        await fs.move(req.file.path, inputPath);
        tempFiles.push(inputPath);

        // Run Whisper transcription
        const result = await runWhisper(inputPath, language, modelSize);

        console.log(`[Transcribe] Done: ${result.segments?.length || 0} segments`);

        res.json(result);

    } catch (error) {
        console.error('[Transcribe] Error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        // Cleanup temp files
        for (const f of tempFiles) {
            await fs.remove(f).catch(() => {});
        }
        // Also cleanup uploaded file if it still exists
        if (req.file?.path) {
            await fs.remove(req.file.path).catch(() => {});
        }
    }
});

/**
 * POST /api/transcribe/url
 * Transcribe a video from URL (downloads first, then transcribes)
 * 
 * Body: { url: string, language?: string }
 */
router.post('/url', async (req, res) => {
    const tempFiles = [];

    try {
        const { url, language, model } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`[Transcribe] URL request: ${url}`);

        // Download video using yt-dlp
        const videoId = uuidv4();
        const outputPath = path.join(TEMP_DIR, `${videoId}.mp4`);

        await downloadForTranscription(url, outputPath);
        tempFiles.push(outputPath);

        // Run Whisper transcription
        const result = await runWhisper(outputPath, language || null, model || 'base');

        console.log(`[Transcribe] Done: ${result.segments?.length || 0} segments`);

        res.json(result);

    } catch (error) {
        console.error('[Transcribe] Error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        for (const f of tempFiles) {
            await fs.remove(f).catch(() => {});
        }
    }
});

/**
 * Run Whisper transcription via Python script
 */
function runWhisper(inputPath, language, modelSize) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../services/transcribe.py');
        const args = [scriptPath, inputPath];
        if (language) args.push(language);
        if (modelSize) args.push(modelSize);

        console.log(`[Whisper] Running: python3 ${args.join(' ')}`);

        const proc = spawn('python3', args, {
            windowsHide: true,
            timeout: 300000, // 5 minutes timeout
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (d) => { stdout += d.toString(); });
        proc.stderr.on('data', (d) => { 
            const text = d.toString();
            stderr += text;
            // Log progress
            if (text.includes('[Whisper]')) {
                console.log(`[Whisper] ${text.trim()}`);
            }
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Whisper failed (exit ${code}): ${stderr.trim()}`));
                return;
            }

            try {
                // Find JSON in output (may have log lines before it)
                const jsonStart = stdout.indexOf('{');
                const jsonEnd = stdout.lastIndexOf('}');
                if (jsonStart === -1 || jsonEnd === -1) {
                    reject(new Error('No JSON output from Whisper'));
                    return;
                }

                const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
                const result = JSON.parse(jsonStr);

                if (result.error) {
                    reject(new Error(result.error));
                    return;
                }

                resolve(result);
            } catch (e) {
                reject(new Error(`Failed to parse Whisper output: ${e.message}`));
            }
        });

        proc.on('error', (err) => {
            reject(new Error(`Failed to run Whisper: ${err.message}`));
        });
    });
}

/**
 * Download video for transcription using yt-dlp
 */
function downloadForTranscription(url, outputPath) {
    return new Promise((resolve, reject) => {
        const { execSync } = require('child_process');

        // Try to find yt-dlp
        let ytdlp = 'yt-dlp';
        const candidates = [
            'yt-dlp',
            '/usr/local/bin/yt-dlp',
            '/app/server/node_modules/yt-dlp-exec/bin/yt-dlp',
        ];

        for (const candidate of candidates) {
            try {
                execSync(`"${candidate}" --version`, { timeout: 5000, stdio: 'pipe' });
                ytdlp = candidate;
                break;
            } catch (e) { /* try next */ }
        }

        // Download audio only (faster for transcription)
        const cmd = `"${ytdlp}" -f "bestaudio[ext=m4a]/bestaudio" --extract-audio --audio-format mp3 -o "${outputPath}" "${url}" --no-playlist --socket-timeout 30`;

        console.log(`[Transcribe] Downloading: ${url}`);

        try {
            execSync(cmd, { timeout: 120000, stdio: 'pipe' });
            
            // Check if file exists (yt-dlp might change extension)
            if (fs.existsSync(outputPath)) {
                resolve(outputPath);
            } else {
                // Check for .mp3 extension
                const mp3Path = outputPath.replace('.mp4', '.mp3');
                if (fs.existsSync(mp3Path)) {
                    fs.renameSync(mp3Path, outputPath);
                    resolve(outputPath);
                } else {
                    reject(new Error('Download failed - file not found'));
                }
            }
        } catch (e) {
            reject(new Error(`Download failed: ${e.message}`));
        }
    });
}

module.exports = router;
