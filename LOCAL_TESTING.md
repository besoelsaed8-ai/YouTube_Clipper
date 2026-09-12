# 🎬 YouTube Clipper - Local Testing Guide

## Quick Start

### Option 1: Run the batch file (Windows)
```
Double-click: start_app.bat
```

### Option 2: Manual setup

#### Terminal 1 - Start Server
```bash
cd server
npm install
npm start
```
Server runs on: http://localhost:3000

#### Terminal 2 - Start Client
```bash
cd client
npm install
npm run dev
```
Client runs on: http://localhost:5173

---

## How to Test

### 📁 Test 1: File Upload (Recommended)
This works **immediately** without any server setup!

1. Open http://localhost:5173
2. Click **"Click to upload"** or drag & drop a video
3. Select any video file (MP4, MOV, AVI, MKV)
4. Click **"Analyze Video"**
5. Choose settings:
   - Clip Duration (30s, 45s, 60s)
   - AI Smart Highlights (optional)
   - Face Tracking (optional)
   - Video Effects (optional)
6. Click **"Start Processing"**
7. Wait for FFmpeg WASM to process in your browser
8. Download your clips!

**Note:** First time may take a few seconds to load FFmpeg WASM engine.

### 🔗 Test 2: YouTube URL
This requires the server to be running.

1. Open http://localhost:5173
2. Paste a YouTube link
3. Click **"Analyze Video"**
4. The server will try to fetch video info
5. If successful, proceed to settings

**Note:** YouTube may block server requests. If this happens:
- Download the video manually from YouTube
- Upload it using the file upload feature

### 🤖 Test 3: AI Features
1. Upload a video
2. Enable **"AI Smart Highlights"**
3. Enable **"Face Tracking"**
4. Choose **Video Effects** (filters, zoom, speed)
5. Click **"Start Processing"**
6. After processing, you'll see:
   - Ranked clips with scores
   - Caption editor with auto-caption
   - Translation options

---

## Features Available

| Feature | Status | Requires Server |
|---------|--------|-----------------|
| File Upload | ✅ Ready | No |
| YouTube URL | ⚠️ May be blocked | Yes |
| AI Highlights | ✅ Ready | No |
| Face Tracking | ✅ Ready | No |
| Auto Captions | ✅ Ready | No |
| Translation | ✅ Ready | No |
| Video Effects | ✅ Ready | No |
| 9:16 Crop | ✅ Ready | No |

---

## Troubleshooting

### "FFmpeg not loaded" error
- Wait a few seconds for WASM to load
- Check browser console for errors
- Try a different browser (Chrome recommended)

### YouTube URL fails
- YouTube blocks server requests
- Use file upload instead
- Or provide cookies for authentication

### Port already in use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## Browser Requirements

- **Chrome 80+** (recommended)
- **Edge 80+**
- **Safari 14+**
- **Firefox 70+** (limited FFmpeg support)

For best results, use **Chrome**.
