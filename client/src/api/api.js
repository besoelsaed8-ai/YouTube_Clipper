import axios from 'axios';
import { saveVideo, loadVideo, deleteVideo } from './videoStore';

// API configuration — same origin (no cross-origin needed in production)
const getBaseURL = () => {
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
});

// ═══════════════════════════════════════════════════════════════
// CLIENT-SIDE DOWNLOAD via Cobalt API (from user's IP, not server)
// Video is saved to DISK (IndexedDB) not RAM!
// ═══════════════════════════════════════════════════════════════
const COBALT_INSTANCES = [
    'https://api.cobalt.tools',
    'https://cobalt-api.kwiatekmiki.com',
    'https://co.eepy.today',
    'https://cobalt.canine.tools',
];

/**
 * Download video DIRECTLY from browser using Cobalt API.
 * This uses the USER'S IP (residential), not the server IP.
 * YouTube doesn't block residential IPs!
 * 
 * IMPORTANT: Video is saved to IndexedDB (disk) not RAM.
 * This means even 2GB videos won't crash the browser.
 */
export const downloadFromBrowser = async (url, onProgress) => {
    const videoId = `yt_${Date.now()}`;

    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[Client] Trying Cobalt: ${instance}`);
            const resp = await fetch(instance, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    videoQuality: '1080',
                    filenameStyle: 'pretty',
                }),
            });

            if (!resp.ok) continue;
            const data = await resp.json();

            if (data?.url) {
                console.log(`[Client] ✅ Cobalt returned download URL`);
                // Download the actual video file
                const videoResp = await fetch(data.url);
                if (!videoResp.ok) continue;

                const contentLength = parseInt(videoResp.headers.get('content-length') || '0');
                const reader = videoResp.body.getReader();
                const chunks = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    if (onProgress && contentLength > 0) {
                        onProgress(Math.round((received / contentLength) * 100));
                    }
                }

                const blob = new Blob(chunks, { type: 'video/mp4' });
                console.log(`[Client] ✅ Downloaded ${Math.round(blob.size / 1024 / 1024)}MB from browser`);

                // Save to IndexedDB (disk storage, not RAM!)
                await saveVideo(videoId, blob, { url, downloadedAt: Date.now() });
                console.log(`[Client] ✅ Saved to disk (IndexedDB)`);

                return { blob, videoId };
            }
        } catch (e) {
            console.log(`[Client] ❌ ${instance} failed: ${e.message}`);
            continue;
        }
    }
    throw new Error('All download methods failed');
};

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
 * Download video file for client-side processing.
 * Strategy: Try browser-side first (Cobalt API from user's IP), then server-side.
 * 
 * Returns: { blob, videoId } or just Blob for server-side
 * - blob: The video data (for immediate processing)
 * - videoId: ID to use for cleanup later
 */
export const downloadVideoFile = async (url, quality, onProgress, cookies = null) => {
    // STEP 1: Try client-side download via Cobalt (from USER's IP — YouTube allows this!)
    // Video is saved to IndexedDB (disk) not RAM!
    try {
        console.log('[Client] Trying browser-side download via Cobalt...');
        if (onProgress) onProgress(0);
        const result = await downloadFromBrowser(url, onProgress);
        if (result && result.blob && result.blob.size > 10000) {
            console.log(`[Client] ✅ Browser download success: ${Math.round(result.blob.size / 1024 / 1024)}MB`);
            return result; // { blob, videoId }
        }
    } catch (e) {
        console.log(`[Client] ❌ Browser download failed: ${e.message}`);
    }

    // STEP 2: Fallback to server-side download
    try {
        console.log('[Client] Trying server-side download...');
        if (onProgress) onProgress(0);
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
        return { blob: response.data, videoId: null };
    } catch (error) {
        // All methods failed
        throw new Error('تعذر تحميل الفيديو من يوتيوب.\n\nالخيارات المتاحة:\n1. حمّل الفيديو من جهازك وارفعه مباشرة هنا\n2. جرّب رابط فيديو آخر\n\n💡 يمكنك أيضًا إدخال كوكيز يوتيوب لتحسين النتائج.');
    }
};

/**
 * Cleanup: Delete video from IndexedDB when done processing
 */
export const cleanupVideo = async (videoId) => {
    if (videoId) {
        await deleteVideo(videoId);
        console.log(`[Client] Cleaned up video ${videoId} from disk`);
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
