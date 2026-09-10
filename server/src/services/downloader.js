const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ytDlp = require('yt-dlp-exec');

const TEMP_DIR = path.join(__dirname, '../../temp');
const FFMPEG_PATH = process.env.FFMPEG_PATH || '';

async function getVideoInfo(url) {
    console.log(`[Downloader] Fetching info for: ${url}`);
    try {
        const output = await ytDlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            ffmpegLocation: FFMPEG_PATH || undefined,
            userAgent: 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)',
            httpHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/'
            },
            extractorArgs: ['youtube:player-client=ios']
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

async function downloadVideo(url, onProgress, quality = 'best') {
    const id = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${id}.mp4`);
    console.log(`[Downloader] Starting download: ${url} -> ${outputPath} (quality: ${quality})`);

    const formatMap = {
        'best': 'bestvideo+bestaudio/best',
        '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
        '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
    };
    const format = formatMap[quality] || formatMap['best'];

    return new Promise((resolve, reject) => {
        const proc = ytDlp.exec(url, {
            output: outputPath,
            format: format,
            mergeOutputFormat: 'mp4',
            noWarnings: true,
            ffmpegLocation: FFMPEG_PATH || undefined,
            userAgent: 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)',
            httpHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/'
            },
            extractorArgs: ['youtube:player-client=ios'],
            socketTimeout: 30
        });

        proc.stdout.on('data', (data) => {
            const line = data.toString();
            const match = line.match(/\[download\]\s+(\d+\.?\d*)%/);
            if (match && onProgress) onProgress(parseFloat(match[1]));
        });

        proc.stderr.on('data', (data) => {
            console.error(`[Downloader Error] ${data.toString()}`);
        });

        proc.on('close', async (code) => {
            if (code === 0) {
                if (await fs.exists(outputPath)) {
                    resolve(outputPath);
                } else {
                    const files = await fs.readdir(TEMP_DIR);
                    const actualFile = files.find(f => f.startsWith(id) && !f.endsWith('.part'));
                    if (actualFile) resolve(path.join(TEMP_DIR, actualFile));
                    else reject(new Error(`Downloaded file not found for ID: ${id}`));
                }
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });
    });
}

module.exports = { getVideoInfo, downloadVideo };
