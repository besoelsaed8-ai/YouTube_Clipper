const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');

const TEMP_DIR = path.join(__dirname, '../../temp');

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Get video metadata using yt-dlp
 */
async function getVideoInfo(url, cookies = null) {
    console.log(`[Downloader] Fetching info for: ${url}`);
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    try {
        // Build yt-dlp command
        let cmd = `yt-dlp --dump-single-json --no-warnings`;
        
        // Add cookies if provided
        if (cookies) {
            const cookiePath = path.join(TEMP_DIR, `cookies_${videoId}.txt`);
            await fs.writeFile(cookiePath, cookies);
            cmd += ` --cookies "${cookiePath}"`;
        }
        
        cmd += ` "https://www.youtube.com/watch?v=${videoId}"`;
        
        console.log(`[Downloader] Running: ${cmd}`);
        const output = execSync(cmd, { 
            encoding: 'utf8', 
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024 
        });
        
        const data = JSON.parse(output);
        
        // Clean up cookie file
        if (cookies) {
            await fs.remove(path.join(TEMP_DIR, `cookies_${videoId}.txt`)).catch(() => {});
        }
        
        console.log(`[Downloader] Info fetched: ${data.title}`);
        return {
            title: data.title,
            thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            duration: data.duration || 0,
            id: videoId
        };
    } catch (error) {
        console.error(`[Downloader] Info fetch failed: ${error.message}`);
        throw new Error('Failed to fetch video info. Make sure you are logged into YouTube and provide cookies.');
    }
}

/**
 * Download video with progress tracking
 */
async function downloadVideo(url, onProgress, quality = 'best', cookies = null) {
    const id = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${id}.mp4`);
    console.log(`[Downloader] Starting download: ${url} -> ${outputPath} (quality: ${quality})`);
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    // Quality presets
    const formatMap = {
        'best': 'bestvideo+bestaudio/best',
        '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
        '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
    };
    const format = formatMap[quality] || formatMap['best'];
    
    try {
        // Build yt-dlp command
        let cmd = `yt-dlp`;
        cmd += ` -f "${format}"`;
        cmd += ` --merge-output-format mp4`;
        cmd += ` --no-warnings`;
        cmd += ` -o "${outputPath}"`;
        
        // Add cookies if provided
        if (cookies) {
            const cookiePath = path.join(TEMP_DIR, `cookies_${videoId}.txt`);
            await fs.writeFile(cookiePath, cookies);
            cmd += ` --cookies "${cookiePath}"`;
        }
        
        cmd += ` "https://www.youtube.com/watch?v=${videoId}"`;
        
        console.log(`[Downloader] Running: ${cmd}`);
        execSync(cmd, { 
            encoding: 'utf8', 
            timeout: 300000, // 5 minutes
            maxBuffer: 100 * 1024 * 1024 
        });
        
        // Clean up cookie file
        if (cookies) {
            await fs.remove(path.join(TEMP_DIR, `cookies_${videoId}.txt`)).catch(() => {});
        }
        
        if (await fs.exists(outputPath)) {
            console.log(`[Downloader] Download completed: ${outputPath}`);
            return outputPath;
        } else {
            throw new Error('Downloaded file not found');
        }
    } catch (error) {
        console.error(`[Downloader] Download failed: ${error.message}`);
        throw new Error('Failed to download video. Make sure you are logged into YouTube and provide cookies.');
    }
}

module.exports = { getVideoInfo, downloadVideo };
