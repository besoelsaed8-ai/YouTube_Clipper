const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');
const axios = require('axios');

const TEMP_DIR = path.join(__dirname, '../../temp');

// Free Cobalt API instances (public)
const COBALT_INSTANCES = [
    'https://api.cobalt.tools',
    'https://cobalt-api.kwiatekmiki.com',
    'https://api.duck.cobalt.tools',
];

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
 * Get video info using yt-dlp (with cookies)
 */
async function getVideoInfoWithYtdlp(url, cookies = null) {
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    try {
        let cmd = `yt-dlp --dump-single-json --no-warnings`;
        
        if (cookies) {
            const cookiePath = path.join(TEMP_DIR, `cookies_${videoId}.txt`);
            await fs.writeFile(cookiePath, cookies);
            cmd += ` --cookies "${cookiePath}"`;
        }
        
        cmd += ` "https://www.youtube.com/watch?v=${videoId}"`;
        
        const output = execSync(cmd, { 
            encoding: 'utf8', 
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024 
        });
        
        const data = JSON.parse(output);
        
        // Clean up
        if (cookies) {
            await fs.remove(path.join(TEMP_DIR, `cookies_${videoId}.txt`)).catch(() => {});
        }
        
        return {
            title: data.title,
            thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            duration: data.duration || 0,
            id: videoId,
            source: 'yt-dlp'
        };
    } catch (error) {
        throw new Error('yt-dlp failed: ' + error.message);
    }
}

/**
 * Get video info using Cobalt API
 */
async function getVideoInfoWithCobalt(url) {
    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[Downloader] Trying Cobalt instance: ${instance}`);
            
            const response = await axios.post(instance, {
                url: url,
                videoQuality: '1080',
                filenameStyle: 'pretty'
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            
            if (response.data && response.data.url) {
                console.log(`[Downloader] Cobalt success with ${instance}`);
                
                // Get video ID for thumbnail
                const videoId = extractVideoId(url);
                
                return {
                    title: response.data.filename || 'YouTube Video',
                    thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null,
                    duration: 0,
                    id: videoId || 'unknown',
                    downloadUrl: response.data.url,
                    source: 'cobalt'
                };
            }
        } catch (error) {
            console.log(`[Downloader] Cobalt failed with ${instance}: ${error.message}`);
            continue;
        }
    }
    return null;
}

/**
 * Get video metadata - tries yt-dlp first, then Cobalt
 */
async function getVideoInfo(url, cookies = null) {
    console.log(`[Downloader] Fetching info for: ${url}`);
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    // Try yt-dlp with cookies first
    if (cookies) {
        try {
            const info = await getVideoInfoWithYtdlp(url, cookies);
            console.log(`[Downloader] Success with yt-dlp`);
            return info;
        } catch (error) {
            console.log(`[Downloader] yt-dlp failed: ${error.message}`);
        }
    }
    
    // Try Cobalt API
    const cobaltInfo = await getVideoInfoWithCobalt(url);
    if (cobaltInfo) {
        return cobaltInfo;
    }
    
    throw new Error('Could not fetch video info. Please try again or upload the video directly.');
}

/**
 * Download video using yt-dlp (with cookies)
 */
async function downloadWithYtdlp(url, outputPath, quality, cookies, onProgress) {
    const videoId = extractVideoId(url);
    
    const formatMap = {
        'best': 'bestvideo+bestaudio/best',
        '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
        '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
    };
    const format = formatMap[quality] || formatMap['best'];
    
    let cmd = `yt-dlp`;
    cmd += ` -f "${format}"`;
    cmd += ` --merge-output-format mp4`;
    cmd += ` --no-warnings`;
    cmd += ` -o "${outputPath}"`;
    
    if (cookies) {
        const cookiePath = path.join(TEMP_DIR, `cookies_${videoId}.txt`);
        await fs.writeFile(cookiePath, cookies);
        cmd += ` --cookies "${cookiePath}"`;
    }
    
    cmd += ` "https://www.youtube.com/watch?v=${videoId}"`;
    
    execSync(cmd, { 
        encoding: 'utf8', 
        timeout: 300000,
        maxBuffer: 100 * 1024 * 1024 
    });
    
    // Clean up
    if (cookies) {
        await fs.remove(path.join(TEMP_DIR, `cookies_${videoId}.txt`)).catch(() => {});
    }
    
    if (await fs.exists(outputPath)) {
        return outputPath;
    }
    throw new Error('Downloaded file not found');
}

/**
 * Download video using Cobalt API
 */
async function downloadWithCobalt(downloadUrl, outputPath, onProgress) {
    const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'stream',
        timeout: 300000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;
    
    const writer = fs.createWriteStream(outputPath);
    
    response.data.on('data', (chunk) => {
        downloadedLength += chunk.length;
        if (totalLength && onProgress) {
            const percent = Math.round((downloadedLength / totalLength) * 100);
            onProgress(percent);
        }
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
    });
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
    
    // Try yt-dlp with cookies first
    if (cookies) {
        try {
            console.log(`[Downloader] Trying yt-dlp with cookies`);
            await downloadWithYtdlp(url, outputPath, quality, cookies, onProgress);
            
            if (await fs.exists(outputPath)) {
                console.log(`[Downloader] Success with yt-dlp`);
                return outputPath;
            }
        } catch (error) {
            console.log(`[Downloader] yt-dlp failed: ${error.message}`);
        }
    }
    
    // Try Cobalt API
    try {
        console.log(`[Downloader] Trying Cobalt API`);
        const cobaltInfo = await getVideoInfoWithCobalt(url);
        if (cobaltInfo && cobaltInfo.downloadUrl) {
            await downloadWithCobalt(cobaltInfo.downloadUrl, outputPath, onProgress);
            
            if (await fs.exists(outputPath)) {
                console.log(`[Downloader] Success with Cobalt`);
                return outputPath;
            }
        }
    } catch (error) {
        console.log(`[Downloader] Cobalt failed: ${error.message}`);
    }
    
    throw new Error('Failed to download video. Please try again or upload the video directly.');
}

module.exports = { getVideoInfo, downloadVideo };
