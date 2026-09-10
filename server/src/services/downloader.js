const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const TEMP_DIR = path.join(__dirname, '../../temp');

// Free Invidious instances (rotate if one fails)
const INVIDIOUS_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://invidious.protokolla.fi',
    'https://vid.puffyan.us',
    'https://yewtu.be',
    'https://invidious.fdn.fr',
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
 * Get video info from Invidious API
 */
async function getVideoInfoFromInvidious(videoId) {
    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            console.log(`[Downloader] Trying Invidious instance: ${instance}`);
            const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const data = response.data;
            if (data && data.title) {
                console.log(`[Downloader] Success with ${instance}: ${data.title}`);
                return {
                    title: data.title,
                    thumbnail: data.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                    duration: data.lengthSeconds || 0,
                    id: videoId,
                    instance: instance,
                    formats: data.formatStreams || [],
                    adaptiveFormats: data.adaptiveFormats || []
                };
            }
        } catch (error) {
            console.log(`[Downloader] Failed with ${instance}: ${error.message}`);
            continue;
        }
    }
    return null;
}

/**
 * Get video metadata - tries Invidious first
 */
async function getVideoInfo(url) {
    console.log(`[Downloader] Fetching info for: ${url}`);
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    // Try Invidious API
    const invidiousInfo = await getVideoInfoFromInvidious(videoId);
    if (invidiousInfo) {
        return invidiousInfo;
    }
    
    throw new Error('All Invidious instances failed. Please try again later or upload the video directly.');
}

/**
 * Download video from Invidious instance
 */
async function downloadFromInvidious(videoId, instance, quality, outputPath, onProgress) {
    // Get video info again to get fresh download URLs
    const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    const data = response.data;
    
    // Find the best format based on quality preference
    let downloadUrl = null;
    const formats = data.formatStreams || [];
    
    // Quality mapping
    const qualityMap = {
        'best': 0, // highest quality
        '2160': 2160,
        '1080': 1080,
        '720': 720,
        '480': 480,
    };
    
    const targetHeight = qualityMap[quality] || 0;
    
    // Sort formats by resolution (highest first)
    const sortedFormats = formats
        .filter(f => f.url && f.resolution)
        .sort((a, b) => {
            const aHeight = parseInt(a.resolution) || 0;
            const bHeight = parseInt(b.resolution) || 0;
            return bHeight - aHeight;
        });
    
    if (targetHeight === 0) {
        // Best quality - take the first one
        downloadUrl = sortedFormats[0]?.url;
    } else {
        // Find closest match
        downloadUrl = sortedFormats.find(f => {
            const height = parseInt(f.resolution) || 0;
            return height <= targetHeight;
        })?.url || sortedFormats[sortedFormats.length - 1]?.url;
    }
    
    if (!downloadUrl) {
        throw new Error('No downloadable format found');
    }
    
    console.log(`[Downloader] Downloading from: ${downloadUrl.substring(0, 100)}...`);
    
    // Download the video
    const writer = fs.createWriteStream(outputPath);
    
    const response2 = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'stream',
        timeout: 300000, // 5 minutes
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    const totalLength = response2.headers['content-length'];
    let downloadedLength = 0;
    
    response2.data.on('data', (chunk) => {
        downloadedLength += chunk.length;
        if (totalLength && onProgress) {
            const percent = Math.round((downloadedLength / totalLength) * 100);
            onProgress(percent);
        }
    });
    
    response2.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
    });
}

/**
 * Download video with progress tracking
 */
async function downloadVideo(url, onProgress, quality = 'best') {
    const id = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${id}.mp4`);
    console.log(`[Downloader] Starting download: ${url} -> ${outputPath} (quality: ${quality})`);
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    // Try each Invidious instance
    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            console.log(`[Downloader] Trying to download from: ${instance}`);
            await downloadFromInvidious(videoId, instance, quality, outputPath, onProgress);
            
            if (await fs.exists(outputPath)) {
                console.log(`[Downloader] Download completed: ${outputPath}`);
                return outputPath;
            }
        } catch (error) {
            console.log(`[Downloader] Failed with ${instance}: ${error.message}`);
            continue;
        }
    }
    
    throw new Error('Failed to download video from all instances. Please try again or upload the video directly.');
}

module.exports = { getVideoInfo, downloadVideo };
