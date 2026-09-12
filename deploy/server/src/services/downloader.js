const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { spawn, execSync } = require('child_process');
const axios = require('axios');

const TEMP_DIR = path.join(__dirname, '../../temp');

// ─── yt-dlp detection ───────────────────────────────────────────
const YTDLP_CANDIDATES = [
    process.env.YTDLP_PATH,
    'yt-dlp',
    path.join(__dirname, '../../node_modules/yt-dlp-exec/bin/yt-dlp'),
    '/usr/local/bin/yt-dlp',
    '/app/server/node_modules/yt-dlp-exec/bin/yt-dlp',
].filter(Boolean);

let resolvedYtdlp = null;
function findYtdlp() {
    if (resolvedYtdlp) return resolvedYtdlp;
    for (const candidate of YTDLP_CANDIDATES) {
        try {
            execSync(`"${candidate}" --version`, { timeout: 10000, stdio: 'pipe' });
            resolvedYtdlp = candidate;
            return candidate;
        } catch (e) { /* try next */ }
    }
    return null;
}

// ─── Helper: extract video ID ───────────────────────────────────
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

function normalizeUrl(url) {
    const videoId = extractVideoId(url);
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    return url;
}

// ─── Helper: run yt-dlp ─────────────────────────────────────────
function runYtdlp(args, { timeoutMs = 300000, onProgress } = {}) {
    return new Promise((resolve, reject) => {
        const bin = findYtdlp();
        if (!bin) return reject(new Error('yt-dlp not installed'));

        const proc = spawn(bin, args, { windowsHide: true });
        let stdout = '';
        let stderr = '';
        let killed = false;

        const timer = setTimeout(() => {
            killed = true;
            try { proc.kill('SIGKILL'); } catch (e) {}
            reject(new Error('yt-dlp timed out'));
        }, timeoutMs);

        proc.stdout.on('data', (d) => { stdout += d; });
        proc.stderr.on('data', (d) => {
            const text = d.toString();
            stderr += text;
            if (onProgress) {
                const m = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
                if (m) onProgress(parseFloat(m[1]));
            }
        });

        proc.on('close', (code) => {
            clearTimeout(timer);
            if (killed) return;
            if (code === 0) resolve(stdout);
            else reject(new Error(stderr.trim().split('\n').filter(Boolean).pop() || `yt-dlp exit ${code}`));
        });
        proc.on('error', (err) => { clearTimeout(timer); reject(err); });
    });
}

// ═══════════════════════════════════════════════════════════════
// METHOD 1: yt-dlp with modern player clients
// ═══════════════════════════════════════════════════════════════
async function getInfoYtdlp(url, cookies = null) {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    let cookieFile = null;
    if (cookies) {
        cookieFile = path.join(TEMP_DIR, `cookies_${Date.now()}.txt`);
        await fs.writeFile(cookieFile, cookies);
    }

    try {
        const args = [
            '--dump-single-json', '--no-warnings', '--no-playlist',
            '--extractor-args', 'youtube:player_client=default,mweb,tv_embedded',
            '--socket-timeout', '15',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ];
        if (cookieFile) args.push('--cookies', cookieFile);
        args.push(normalizeUrl(url));

        const output = await runYtdlp(args, { timeoutMs: 45000 });
        const data = JSON.parse(output);
        return {
            title: data.title, thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            duration: data.duration || 0, id: videoId, source: 'yt-dlp',
        };
    } finally {
        if (cookieFile) await fs.remove(cookieFile).catch(() => {});
    }
}

// ═══════════════════════════════════════════════════════════════
// METHOD 2: @distube/ytdl-core
// ═══════════════════════════════════════════════════════════════
async function getInfoYtdlCore(url) {
    const ytdl = require('@distube/ytdl-core');
    const info = await ytdl.getInfo(url);
    const d = info.videoDetails;
    return {
        title: d.title, thumbnail: d.thumbnails?.[d.thumbnails.length - 1]?.url || null,
        duration: parseInt(d.lengthSeconds) || 0, id: d.videoId, source: 'ytdl-core',
    };
}

// ═══════════════════════════════════════════════════════════════
// METHOD 3: YouTube oEmbed (official, never blocked)
// ═══════════════════════════════════════════════════════════════
async function getInfoOEmbed(url) {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');
    const resp = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { timeout: 10000 }
    );
    return {
        title: resp.data.title || 'YouTube Video',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 0, id: videoId, author: resp.data.author_name, source: 'oembed',
    };
}

// ═══════════════════════════════════════════════════════════════
// METHOD 4: Cobalt API (multiple public instances)
// ═══════════════════════════════════════════════════════════════
const COBALT_INSTANCES = [
    'https://api.cobalt.tools',
    'https://cobalt-api.kwiatekmiki.com',
    'https://api.duck.cobalt.tools',
    'https://cobalt.canine.tools',
    'https://co.eepy.today',
    'https://cobalt.api.timelessnesses.me',
];

async function getInfoCobalt(url) {
    const videoId = extractVideoId(url);
    for (const instance of COBALT_INSTANCES) {
        try {
            const resp = await axios.post(instance, {
                url: normalizeUrl(url),
                videoQuality: '1080',
                filenameStyle: 'pretty',
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                timeout: 15000,
            });
            if (resp.data?.url) {
                return {
                    title: resp.data.filename || 'YouTube Video',
                    thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null,
                    duration: 0, id: videoId || 'unknown',
                    downloadUrl: resp.data.url, source: 'cobalt',
                };
            }
        } catch (e) { continue; }
    }
    throw new Error('All Cobalt instances failed');
}

// ═══════════════════════════════════════════════════════════════
// METHOD 5: Invidious API (public instances)
// ═══════════════════════════════════════════════════════════════
const INVIDIOUS_INSTANCES = [
    'https://vid.puffyan.us',
    'https://invidious.fdn.fr',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://iv.datura.network',
    'https://invidious.privacyredirect.com',
    'https://yt.artemislena.eu',
    'https://invidious.protokoll-11.de',
];

async function getInfoInvidious(url) {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            const resp = await axios.get(`${instance}/api/v1/videos/${videoId}`, { timeout: 15000 });
            if (resp.data) {
                const d = resp.data;
                const formatStreams = d.formatStreams || [];
                const adaptiveFormats = d.adaptiveFormats || [];
                // Find a downloadable format
                let downloadUrl = null;
                const mp4Stream = formatStreams.find(f => f.container === 'mp4' && f.resolution === '720p')
                    || formatStreams.find(f => f.container === 'mp4')
                    || formatStreams[0];
                if (mp4Stream?.url) downloadUrl = mp4Stream.url;

                return {
                    title: d.title || 'YouTube Video',
                    thumbnail: d.videoThumbnails?.find(t => t.quality === 'maxres')?.url
                        || d.videoThumbnails?.[d.videoThumbnails.length - 1]?.url
                        || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                    duration: d.lengthSeconds || 0, id: videoId,
                    downloadUrl, source: 'invidious',
                };
            }
        } catch (e) { continue; }
    }
    throw new Error('All Invidious instances failed');
}

// ═══════════════════════════════════════════════════════════════
// METHOD 6: Piped API (public instances)
// ═══════════════════════════════════════════════════════════════
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.moomoo.me',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.in.projectsegfau.lt',
];

async function getInfoPiped(url) {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    for (const instance of PIPED_INSTANCES) {
        try {
            const resp = await axios.get(`${instance}/streams/${videoId}`, { timeout: 15000 });
            if (resp.data) {
                const d = resp.data;
                const videoStreams = d.videoStreams || [];
                // Find best mp4 stream
                const mp4Stream = videoStreams.find(s => s.mimeType?.includes('video/mp4') && s.quality === '720p')
                    || videoStreams.find(s => s.mimeType?.includes('video/mp4'))
                    || videoStreams[0];

                return {
                    title: d.title || 'YouTube Video',
                    thumbnail: d.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                    duration: d.duration || 0, id: videoId,
                    downloadUrl: mp4Stream?.url || null, source: 'piped',
                };
            }
        } catch (e) { continue; }
    }
    throw new Error('All Piped instances failed');
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC: getVideoInfo — tries ALL methods in order
// ═══════════════════════════════════════════════════════════════
async function getVideoInfo(url, cookies = null) {
    console.log(`[Downloader] Fetching info for: ${url}`);
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    const methods = [
        ['yt-dlp', () => getInfoYtdlp(url, cookies)],
        ['ytdl-core', () => getInfoYtdlCore(url)],
        ['Cobalt', () => getInfoCobalt(url)],
        ['Invidious', () => getInfoInvidious(url)],
        ['Piped', () => getInfoPiped(url)],
        ['oEmbed', () => getInfoOEmbed(url)],
    ];

    let lastError;
    for (const [name, fn] of methods) {
        try {
            console.log(`[Downloader] Trying ${name}...`);
            const info = await fn();
            console.log(`[Downloader] ✅ ${name} succeeded`);
            return info;
        } catch (error) {
            console.log(`[Downloader] ❌ ${name} failed: ${error.message}`);
            lastError = error;
        }
    }

    throw new Error('Could not fetch video info. YouTube may be blocking requests. Try uploading the video directly.');
}

// ═══════════════════════════════════════════════════════════════
// DOWNLOAD: downloadVideo — tries ALL methods in order
// ═══════════════════════════════════════════════════════════════

// Download with yt-dlp
async function downloadYtdlp(url, outputPath, quality, cookies, onProgress) {
    const formatMap = {
        'best': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
    };
    const format = formatMap[quality] || formatMap['best'];

    let cookieFile = null;
    if (cookies) {
        cookieFile = path.join(TEMP_DIR, `cookies_${Date.now()}.txt`);
        await fs.writeFile(cookieFile, cookies);
    }

    try {
        const args = [
            '-f', format, '--merge-output-format', 'mp4',
            '--no-warnings', '--no-playlist', '--newline',
            '--extractor-args', 'youtube:player_client=default,mweb,tv_embedded',
            '--socket-timeout', '15', '--retries', '3',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            '-o', outputPath,
        ];
        if (cookieFile) args.push('--cookies', cookieFile);
        args.push(normalizeUrl(url));

        await runYtdlp(args, { timeoutMs: 600000, onProgress });

        if (await fs.exists(outputPath)) return outputPath;
        const files = await fs.readdir(TEMP_DIR);
        const match = files.find(f => f.startsWith(path.basename(outputPath, '.mp4')));
        if (match) return path.join(TEMP_DIR, match);
        throw new Error('File not found after download');
    } finally {
        if (cookieFile) await fs.remove(cookieFile).catch(() => {});
    }
}

// Download with @distube/ytdl-core
async function downloadYtdlCore(url, outputPath, quality, onProgress) {
    const ytdl = require('@distube/ytdl-core');
    return new Promise((resolve, reject) => {
        const video = ytdl(url, { quality: 'highest', highWaterMark: 32 * 1024 * 1024 });
        const writer = fs.createWriteStream(outputPath);
        video.on('progress', (chunk, downloaded, total) => {
            if (onProgress && total > 0) onProgress(Math.round((downloaded / total) * 100));
        });
        video.on('error', reject);
        writer.on('error', reject);
        writer.on('finish', () => resolve(outputPath));
        video.pipe(writer);
    });
}

// Download from a direct URL (Cobalt/Invidious/Piped)
async function downloadFromUrl(downloadUrl, outputPath, onProgress) {
    const response = await axios({
        url: downloadUrl, method: 'GET', responseType: 'stream', timeout: 600000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        maxRedirects: 10,
    });

    const totalLength = parseInt(response.headers['content-length']) || 0;
    let downloadedLength = 0;

    const writer = fs.createWriteStream(outputPath);
    response.data.on('data', (chunk) => {
        downloadedLength += chunk.length;
        if (totalLength > 0 && onProgress) {
            onProgress(Math.round((downloadedLength / totalLength) * 100));
        }
    });
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
        response.data.on('error', reject);
    });
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC: downloadVideo — master download function
// ═══════════════════════════════════════════════════════════════
async function downloadVideo(url, onProgress, quality = 'best', cookies = null) {
    const id = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${id}.mp4`);
    console.log(`[Downloader] Starting download: ${url}`);

    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    const tryMethod = async (name, fn) => {
        try {
            console.log(`[Downloader] Trying download via ${name}...`);
            if (onProgress) onProgress(0);
            const result = await fn();
            if (result && await fs.exists(result)) {
                const stat = await fs.stat(result);
                if (stat.size > 10000) { // At least 10KB
                    console.log(`[Downloader] ✅ Download success via ${name} (${Math.round(stat.size / 1024 / 1024)}MB)`);
                    return result;
                }
                console.log(`[Downloader] ❌ ${name}: file too small (${stat.size} bytes)`);
                await fs.remove(result).catch(() => {});
            }
            return null;
        } catch (error) {
            console.log(`[Downloader] ❌ ${name} failed: ${error.message}`);
            return null;
        }
    };

    // 1. yt-dlp (most reliable when it works)
    const r1 = await tryMethod('yt-dlp', () => downloadYtdlp(url, outputPath, quality, cookies, onProgress));
    if (r1) return r1;

    // 2. @distube/ytdl-core
    const r2 = await tryMethod('ytdl-core', () => downloadYtdlCore(url, outputPath, quality, onProgress));
    if (r2) return r2;

    // 3. Try to get direct URL from Cobalt/Invidious/Piped and download
    const serviceMethods = [
        ['Cobalt', () => getInfoCobalt(url)],
        ['Invidious', () => getInfoInvidious(url)],
        ['Piped', () => getInfoPiped(url)],
    ];

    for (const [name, getInfo] of serviceMethods) {
        const info = await tryMethod(name, async () => {
            const data = await getInfo();
            if (data?.downloadUrl) {
                return await downloadFromUrl(data.downloadUrl, outputPath, onProgress);
            }
            return null;
        });
        if (info) return info;
    }

    throw new Error('All download methods failed. YouTube may be blocking server requests. Please upload the video file directly.');
}

module.exports = { getVideoInfo, downloadVideo };
