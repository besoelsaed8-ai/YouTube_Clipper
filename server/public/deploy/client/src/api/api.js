import axios from 'axios';

// In development: connect to localhost:3000
// In production: connect to same host on port 3000 (or Railway URL)
const getBaseURL = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // Production: same host, same port (no :3000)
    return `${window.location.protocol}//${window.location.hostname}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

export const getVideoInfo = async (url, cookies = null) => {
    const response = await api.post('/info', { url, cookies });
    return response.data;
};

export const processVideo = async (url, duration, crop, outputDir, shortsOnly, quality) => {
    const response = await api.post('/process', { url, duration, crop, outputDir, shortsOnly, quality });
    return response.data;
};

/**
 * Download video file from server for client-side processing
 * Server only downloads — processing happens in the browser!
 */
export const downloadVideoFile = async (url, quality, onProgress, cookies = null) => {
    const response = await api.post('/download', { url, quality, cookies }, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percent);
            }
        },
        timeout: 600000, // 10 minutes timeout
    });
    return response.data;
};

export const getJobStatus = async (jobId) => {
    const response = await api.get(`/status/${jobId}`);
    return response.data;
};

export default api;
