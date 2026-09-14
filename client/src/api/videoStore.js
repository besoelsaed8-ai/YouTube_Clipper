/**
 * VideoStore — IndexedDB-based video storage
 * Stores video data on DISK (not RAM) so even large videos won't crash the browser.
 * 
 * How it works:
 * 1. Video is downloaded in chunks
 * 2. Each chunk is saved to IndexedDB (which uses disk space)
 * 3. When processing, chunks are read back from IndexedDB
 * 4. When user closes the tab → IndexedDB is automatically cleaned up
 */

const DB_NAME = 'YouTubeClipperDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

/**
 * Save a video blob to IndexedDB (disk storage)
 * @param {string} videoId - Unique ID for this video
 * @param {Blob} blob - The video file
 * @param {object} metadata - { title, thumbnail, duration, etc }
 */
export async function saveVideo(videoId, blob, metadata = {}) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.put({
        id: videoId,
        blob: blob,
        metadata: metadata,
        savedAt: Date.now(),
        size: blob.size,
    });
    
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
            console.log(`[VideoStore] Saved ${Math.round(blob.size / 1024 / 1024)}MB to disk (IndexedDB)`);
            resolve();
        };
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Load a video blob from IndexedDB
 * @param {string} videoId 
 * @returns {Blob|null}
 */
export async function loadVideo(videoId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = store.get(videoId);
        request.onsuccess = () => {
            const result = request.result;
            if (result) {
                console.log(`[VideoStore] Loaded ${Math.round(result.size / 1024 / 1024)}MB from disk`);
                resolve(result.blob);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete a video from IndexedDB
 * @param {string} videoId 
 */
export async function deleteVideo(videoId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(videoId);
    
    return new Promise((resolve) => {
        tx.oncomplete = () => {
            console.log(`[VideoStore] Deleted video ${videoId} from disk`);
            resolve();
        };
    });
}

/**
 * Get storage usage info
 */
export async function getStorageInfo() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
        const request = store.getAllKeys();
        request.onsuccess = () => {
            resolve({
                videoCount: request.result.length,
                keys: request.result,
            });
        };
        request.onerror = () => resolve({ videoCount: 0, keys: [] });
    });
}
