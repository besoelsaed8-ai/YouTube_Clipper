import axios from 'axios';

// API configuration — same origin (no cross-origin needed in production)
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
 * Download video file from server for client-side processing.
 * If "best" quality fails, retries once at lower quality automatically.
 */
export const downloadVideoFile = async (url, quality, onProgress, cookies = null) => {
    let lastError = '';

    const makeRequest = async (q) => {
        return api.post('/download', { url, quality: q, cookies }, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
            timeout: 600000,
        });
    };

    // First attempt
    try {
        const response = await makeRequest(quality);
        return response.data;
    } catch (error) {
        lastError = error?.response?.data?.error || error?.message || 'Connection failed';

        // If we asked for "best" or "1080" and it failed, retry at lower quality
        if (quality && !['worst', '480'].includes(quality)) {
            try {
                if (onProgress) onProgress(0);
                const retry = await makeRequest('480');
                return retry.data;
            } catch (retryError) {
                lastError = retryError?.response?.data?.error || retryError?.message || lastError;
            }
        }

        // Build a helpful error message
        let helpfulMessage = `Could not download this video: ${lastError}`;
        if (lastError.includes('timed out') || lastError.includes('timeout')) {
            helpfulMessage += '\n\nThe server took too long. The video might be too long or YouTube is slow right now.';
        } else if (lastError.includes('blocked') || lastError.includes('403')) {
            helpfulMessage += '\n\nYouTube is blocking this download. Try uploading the video file instead.';
        } else if (lastError.includes('not found') || lastError.includes('404')) {
            helpfulMessage += '\n\nThis video might be private or deleted.';
        }

        throw new Error(helpfulMessage);
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
