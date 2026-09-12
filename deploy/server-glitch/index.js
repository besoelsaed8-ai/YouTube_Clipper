/**
 * Simplified server for Glitch.com
 * - Serves static frontend
 * - YouTube oEmbed info endpoint (no yt-dlp needed)
 * - All video processing happens in browser with FFmpeg WASM
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ─── YouTube oEmbed (official API, never blocked) ───────────
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

app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const videoId = extractVideoId(url);
        if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

        // Try oEmbed first (official, never blocked)
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await axios.get(oembedUrl, { timeout: 10000 });

            return res.json({
                title: response.data.title || 'YouTube Video',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                duration: 0,
                id: videoId,
                author: response.data.author_name,
                source: 'oembed',
            });
        } catch (e) {
            // oEmbed failed, return basic info
            return res.json({
                title: 'YouTube Video',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                duration: 0,
                id: videoId,
                source: 'thumbnail-only',
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', platform: 'glitch' });
});

// ─── Serve frontend ─────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    // SPA fallback - serve index.html for all routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });

    console.log('Serving frontend from', clientBuildPath);
} else {
    app.get('*', (req, res) => {
        res.status(404).json({ error: 'Frontend not built. Run: cd client && npm run build' });
    });
}

// ─── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
