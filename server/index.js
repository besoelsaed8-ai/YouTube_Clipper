require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const rateLimit = require('express-rate-limit');
const videoRoutes = require('./src/routes/video');
const transcribeRoutes = require('./src/routes/transcribe');
const { cleanupTempFiles } = require('./src/utils/cleanup');
const { initSocket, emitProgress, emitCompleted, emitFailed } = require('./src/services/socket');
const { addVideoJob, addCleanupJob } = require('./src/services/queue');

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT, 10) || 3000;

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO
// ═══════════════════════════════════════════════════════════════
initSocket(server);

// ═══════════════════════════════════════════════════════════════
// FFMPEG CHECK
// ═══════════════════════════════════════════════════════════════
const ffmpeg = require('fluent-ffmpeg');
const FFMPEG_PATH = process.env.FFMPEG_PATH || '';
const FFPROBE_PATH = process.env.FFPROBE_PATH || '';

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

if (FFMPEG_PATH && FFPROBE_PATH) {
  ffmpeg.getAvailableFormats(function (err, formats) {
    if (err) {
      console.warn('WARNING: FFMPEG/FFPROBE not found:', err.message);
    } else {
      console.log('FFMPEG & FFPROBE are confirmed working.');
    }
  });
} else {
  console.log('FFMPEG paths not set - using client-side processing (ffmpeg.wasm)');
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rate limiting — protect API from abuse
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a minute.' },
    keyGenerator: (req) => {
        // Use IP, but allow override for proxied requests
        return req.ip || req.connection.remoteAddress;
    },
});

const strictLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10, // Only 10 heavy requests (download/transcribe) per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many heavy requests. Please slow down.' },
});

// Apply to API routes
app.use('/api/info', apiLimiter);
app.use('/api/download', strictLimiter);
app.use('/api/transcribe', strictLimiter);
app.use('/api/process', strictLimiter);

// Static files for generated clips
app.use('/downloads', express.static(path.join(__dirname, 'output')));

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
const clipDirectRoutes = require('./src/routes/clipDirect');
const cobaltProxyRoutes = require('./src/routes/cobaltProxy');

app.use('/api', videoRoutes);
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/clip-direct', strictLimiter, clipDirectRoutes);
app.use('/api/cobalt-proxy', apiLimiter, cobaltProxyRoutes);

// ═══════════════════════════════════════════════════════════════
// QUEUE API (for submitting jobs)
// ═══════════════════════════════════════════════════════════════
app.post('/api/job', async (req, res) => {
    try {
        const { url, quality, language, options } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const job = await addVideoJob({ url, quality, language, options });

        res.json({
            jobId: job.id,
            status: 'queued',
            message: 'Job added to queue. Connect via WebSocket for live updates.',
        });
    } catch (error) {
        console.error('[API] Job creation failed:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Bypass rate limit for health check
app.get('/health', (req, res) => {
    const { getClientCount } = require('./src/services/socket');
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        connectedClients: getClientCount(),
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/job/:id', async (req, res) => {
    try {
        const { videoQueue } = require('./src/services/queue');
        const job = await videoQueue.getJob(req.params.id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const progress = job.progress;

        res.json({
            jobId: job.id,
            state,
            progress,
            data: job.data,
            result: job.returnvalue,
            failedReason: job.failedReason,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
    const { getClientCount } = require('./src/services/socket');
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        connectedClients: getClientCount(),
        timestamp: new Date().toISOString(),
    });
});

// ═══════════════════════════════════════════════════════════════
// SERVE FRONTEND
// ═══════════════════════════════════════════════════════════════
const clientBuildPath = path.join(__dirname, 'public/client');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  console.log('Serving frontend from', clientBuildPath);
}

// ═══════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'temp'));
fs.ensureDirSync(path.join(__dirname, 'output'));

// Start cleanup job (every 10 minutes)
setInterval(cleanupTempFiles, 10 * 60 * 1000);

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket ready on port ${PORT}`);
    console.log(`Queue system ready`);
});

module.exports = { app, server };
