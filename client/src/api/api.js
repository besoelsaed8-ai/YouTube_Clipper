import axios from 'axios';

const getBaseURL = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    return `${window.location.protocol}//${window.location.hostname}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

export const getVideoInfo = async (url, cookies = null) => {
    const response = await api.post('/info', { url, cookies });
    return response.data;
};

export const processVideo = async (url, duration, crop, outputDir, shortsOnly, quality, cookies = null) => {
    const response = await api.post('/process', { url, duration, crop, outputDir, shortsOnly, quality, cookies });
    return response.data;
};

export const downloadVideoFile = async (url, quality, onProgress, cookies = null) => {
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
};

export const getJobStatus = async (jobId) => {
    const response = await api.get(`/status/${jobId}`);
    return response.data;
};

export default api;
