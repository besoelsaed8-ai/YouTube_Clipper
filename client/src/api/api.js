import axios from 'axios';

// API configuration for Netlify Functions
const getBaseURL = () => {
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
});

/**
 * Get video info from YouTube
 */
export const getVideoInfo = async (url, cookies = null) => {
    try {
        const response = await api.post('/info', { url, cookies });
        return response.data;
    } catch (error) {
        // Fallback: extract video ID and return basic info
        const videoId = extractVideoId(url);
        if (videoId) {
            return {
                title: 'YouTube Video',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                duration: 0,
                id: videoId,
                source: 'fallback',
            };
        }
        throw error;
    }
};

/**
 * Process video (server-side) — rarely used now
 */
export const processVideo = async (url, duration, crop, outputDir, shortsOnly, quality) => {
    const response = await api.post('/process', { url, duration, crop, outputDir, shortsOnly, quality });
    return response.data;
};

/**
 * Download video file from server for client-side processing
 */
export const downloadVideoFile = async (url, quality, onProgress, cookies = null) => {
    try {
        const response = await api.post('/download', { url, quality, cookies }, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
            timeout: 600000,
        });
        return response.data;
    } catch (error) {
        throw new Error('YouTube download failed. Please upload the video file directly.');
    }
};

/**
 * Get job status
 */
export const getJobStatus = async (jobId) => {
    const response = await api.get(`/status/${jobId}`);
    return response.data;
};

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
        /youtube\.com\/live\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export default api;
