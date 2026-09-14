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

// ═══════════════════════════════════════════════════════════════
// FREE CORS PROXIES (to call Cobalt API from browser)
// ═══════════════════════════════════════════════════════════════
const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Call Cobalt API via CORS proxy (from browser, zero server load)
 */
async function callCobaltViaProxy(cobaltUrl, body) {
    for (const proxyFn of CORS_PROXIES) {
        try {
            const proxyUrl = proxyFn(cobaltUrl);
            console.log(`[Client] Trying CORS proxy: ${proxyUrl.slice(0, 60)}...`);
            const resp = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                timeout: 30000,
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data?.url) return data;
            }
        } catch (e) {
            console.log(`[Client] ❌ CORS proxy failed: ${e.message}`);
            continue;
        }
    }
    return null;
}

/**
 * Download video from browser — ZERO server load!
 * 
 * Strategy:
 * 1. Browser calls Cobalt API via CORS proxy → gets CDN download URL
 * 2. Browser downloads from CDN directly
 * 3. Video saved to IndexedDB (disk, not RAM)
 * 
 * Server is NOT involved at all! All processing happens on user's device.
 */
export const downloadFromBrowser = async (url, onProgress) => {
    const videoId = `yt_${Date.now()}`;

    // Step 1: Get CDN URL from Cobalt via CORS proxy (browser → proxy → Cobalt)
    let downloadUrl = null;

    // Try direct first (some Cobalt instances have CORS)
    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[Client] Trying direct: ${instance}`);
            const resp = await fetch(instance, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, videoQuality: '1080', filenameStyle: 'pretty' }),
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data?.url) { downloadUrl = data.url; break; }
            }
        } catch (e) { continue; }
    }

    // If direct failed, try via CORS proxy
    if (!downloadUrl) {
        for (const instance of COBALT_INSTANCES) {
            const data = await callCobaltViaProxy(instance, {
                url, videoQuality: '1080', filenameStyle: 'pretty'
            });
            if (data?.url) { downloadUrl = data.url; break; }
        }
    }

    // Last resort: try server proxy
    if (!downloadUrl) {
        try {
            console.log('[Client] Trying server proxy as last resort...');
            const resp = await api.post('/cobalt-proxy', { url });
            if (resp.data?.downloadUrl) downloadUrl = resp.data.downloadUrl;
        } catch (e) { /* server also failed */ }
    }

    if (!downloadUrl) throw new Error('All download methods failed');

    console.log('[Client] ✅ Got CDN URL, downloading in browser...');

    // Step 2: Download from CDN directly in browser
    const videoResp = await fetch(downloadUrl);
    if (!videoResp.ok) throw new Error(`CDN download failed: ${videoResp.status}`);

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
    console.log(`[Client] ✅ Downloaded ${Math.round(blob.size / 1024 / 1024)}MB from CDN`);

    // Step 3: Save to IndexedDB (disk storage, not RAM!)
    await saveVideo(videoId, blob, { url, downloadedAt: Date.now() });
    console.log(`[Client] ✅ Saved to disk (IndexedDB)`);

    return { blob, videoId };
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
