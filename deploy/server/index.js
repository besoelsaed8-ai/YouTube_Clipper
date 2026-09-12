require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const videoRoutes = require('./src/routes/video');
const { cleanupTempFiles } = require('./src/utils/cleanup');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Check for ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const FFMPEG_PATH = process.env.FFMPEG_PATH || '';
const FFPROBE_PATH = process.env.FFPROBE_PATH || '';

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

// Only check ffmpeg if paths are provided (client-side processing uses ffmpeg.wasm)
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

// Middleware
app.use(cors());
app.use(express.json());

// Static files for generated clips
app.use('/downloads', express.static(path.join(__dirname, 'output')));

// Routes
app.use('/api', videoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend in production
const clientBuildPath = path.join(__dirname, 'public/client');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  console.log('Serving frontend from', clientBuildPath);
}

// Start cleanup job (every 10 minutes)
setInterval(cleanupTempFiles, 10 * 60 * 1000);

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'temp'));
fs.ensureDirSync(path.join(__dirname, 'output'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
