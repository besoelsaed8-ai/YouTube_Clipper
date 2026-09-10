const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ytDlp = require('yt-dlp-exec');

const TEMP_DIR = path.join(__dirname, '../../temp');

const FFMPEG_PATH = process.env.FFMPEG_PATH || '';

/**
 * Get video metadata
 * @param {string} url 
 * @returns {Promise<object>}
 */
async function getVideoInfo(url) {
    console.log(`[Downloader] Fetching info for: ${url}`);
    try {
        const output = await ytDlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            ffmpegLocation: FFMPEG_PATH || undefined,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            httpHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/'
            },
            extractorArgs: ['youtube:player-client=web']
        });
        console.log(`[Downloader] Info fetched: ${output.title}`);
        return {
            title: output.title,
            thumbnail: output.thumbnail,
            duration: output.duration,
            id: output.id
        };
    } catch (error) {
        console.error(`[Downloader] Info fetch failed: ${error.message}`);
        throw new Error('Failed to fetch video info: ' + error.message);
    }
}

/**
 * Download video with progress tracking
 * @param {string} url 
 * @param {function} onProgress callback for progress updates (0-100)
 * @returns {Promise<string>} path to downloaded file
 */
async function downloadVideo(url, onProgress, quality = 'best') {
    const id = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${id}.mp4`);
    console.log(`[Downloader] Starting download: ${url} -> ${outputPath} (quality: ${quality})`);

    // Quality presets
    const formatMap = {
        'best': 'bestvideo+bestaudio/best',
        '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
        '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
    };
    const format = formatMap[quality] || formatMap['best'];

    return new Promise((resolve, reject) => {
        const process = ytDlp.exec(url, {
            output: outputPath,
            format: format,
            mergeOutputFormat: 'mp4',
            noWarnings: true,
            ffmpegLocation: FFMPEG_PATH || undefined,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            httpHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/'
            },
            extractorArgs: ['youtube:player-client=web'],
            socketTimeout: 30
        });

        process.stdout.on('data', (data) => {
            const line = data.toString();
            const match = line.match(/\[download\]\s+(\d+\.?\d*)%/);
            if (match && onProgress) {
                const percent = parseFloat(match[1]);
                onProgress(percent);
            }
        });

        process.stderr.on('data', (data) => {
            console.error(`[Downloader Error] ${data.toString()}`);
        });

        process.on('close', async (code) => {
            if (code === 0) {
                if (await fs.exists(outputPath)) {
                    console.log(`[Downloader] Download completed: ${outputPath}`);
                    resolve(outputPath);
                } else {
                    const files = await fs.readdir(TEMP_DIR);
                    const actualFile = files.find(f => f.startsWith(id) && !f.endsWith('.part'));
                    if (actualFile) {
                        const actualPath = path.join(TEMP_DIR, actualFile);
                        console.log(`[Downloader] Found file with different name/extension: ${actualPath}`);
                        resolve(actualPath);
                    } else {
                        reject(new Error(`Downloaded file not found for ID: ${id}`));
                    }
                }
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });
    });
}

module.exports = { getVideoInfo, downloadVideo };
