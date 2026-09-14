const express = require('express');
const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');

const router = express.Router();
const TEMP_DIR = path.join(__dirname, '../../temp');

// yt-dlp detection
const YTDLP_CANDIDATES = [
    process.env.YTDLP_PATH,
    'yt-dlp',
    '/usr/local/bin/yt-dlp',
].filter(Boolean);

let resolvedYtdlp = null;
function findYtdlp() {
    if (resolvedYtdlp) return resolvedYtdlp;
    for (const candidate of YTDLP_CANDIDATES) {
        try {
            execSync(`"${candidate}" --version`, { timeout: 10000, stdio: 'pipe' });
            resolvedYtdlp = candidate;
            return candidate;
        } catch (e) { /* try next */ }
    }
    return null;
}

/**
 * POST /api/clip-direct
 * Direct clipping: yt-dlp gets stream URLs, FFmpeg clips directly
 * Body: { url, start, end, outputFormat? }
 */
router.post('/', async (req, res) => {
    const { url, start, end, outputFormat = 'mp4' } = req.body;

    if (!url || !start || !end) {
        return res.status(400).json({ error: 'url, start, and end are required' });
    }

    const jobId = uuidv4();
    const outputPath = path.join(TEMP_DIR, `clip_${jobId}.${outputFormat}`);

    try {
        const bin = findYtdlp();
        if (!bin) {
            return res.status(500).json({ error: 'yt-dlp not installed on server' });
        }

        console.log(`[ClipDirect] Starting: ${url} (${start} → ${end})`);

        // Step 1: Get direct stream URLs from YouTube
        const getStreamsCmd = `"${bin}" -g -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --no-warnings --no-playlist --extractor-args "youtube:player_client=default,mweb,tv_embedded" --socket-timeout 15 --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" "${url}"`;

        const streamUrls = await new Promise((resolve, reject) => {
            exec(getStreamsCmd, { timeout: 60000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[ClipDirect] yt-dlp -g failed: ${stderr}`);
                    reject(new Error('فشل جلب روابط يوتيوب المباشرة. يوتيوب قد يحظر الطلبات من السيرفر.'));
                } else {
                    const urls = stdout.trim().split('\n').filter(u => u.startsWith('http'));
                    if (urls.length === 0) {
                        reject(new Error('لم يتم العثور على روابط بث مباشرة'));
                    } else {
                        resolve(urls);
                    }
                }
            });
        });

        console.log(`[ClipDirect] Got ${streamUrls.length} stream URL(s)`);

        const videoStreamUrl = streamUrls[0];
        const audioStreamUrl = streamUrls.length > 1 ? streamUrls[1] : streamUrls[0];

        // Step 2: Use FFmpeg to clip directly from stream URLs
        const ffmpegArgs = [
            '-ss', start,
            '-to', end,
            '-i', videoStreamUrl,
            '-ss', start,
            '-to', end,
            '-i', audioStreamUrl,
            '-map', '0:v',
            '-map', '1:a',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-strict', '-2',
            '-y',
            outputPath
        ];

        await new Promise((resolve, reject) => {
            const proc = spawn('ffmpeg', ffmpegArgs, { windowsHide: true });
            let stderr = '';

            proc.stderr.on('data', (d) => { stderr += d.toString(); });

            proc.on('close', (code) => {
                if (code === 0) {
                    console.log(`[ClipDirect] ✅ Clip created: ${outputPath}`);
                    resolve();
                } else {
                    console.error(`[ClipDirect] FFmpeg error: ${stderr.slice(-500)}`);
                    reject(new Error('فشلت عملية قص الفيديو'));
                }
            });

            proc.on('error', (err) => reject(err));
        });

        // Step 3: Send the file
        if (await fs.exists(outputPath)) {
            const stat = await fs.stat(outputPath);
            console.log(`[ClipDirect] File size: ${Math.round(stat.size / 1024)}KB`);

            res.download(outputPath, `youtube-clip.${outputFormat}`, async (err) => {
                // Clean up after download
                await fs.remove(outputPath).catch(() => {});
                if (err && !res.headersSent) {
                    res.status(500).json({ error: 'Failed to send clip' });
                }
            });
        } else {
            res.status(500).json({ error: 'Clip file was not created' });
        }

    } catch (error) {
        console.error(`[ClipDirect] Error: ${error.message}`);
        await fs.remove(outputPath).catch(() => {});

        if (!res.headersSent) {
            res.status(500).json({
                error: error.message,
                tip: 'يمكنك تحميل الفيديو من جهازك وقصه مباشرة في المتصفح'
            });
        }
    }
});

module.exports = router;
