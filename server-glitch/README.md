# YouTube Clipper - Glitch.com Deployment

## Quick Deploy to Glitch

1. Go to https://glitch.com
2. Sign in with Google
3. Click "New Project" → "Import from GitHub"
4. Enter: `https://github.com/besoelsaed8-ai/YouTube_Clipper`
5. Wait 2-3 minutes for build

## How it works

- **Frontend**: React app with FFmpeg WASM (runs in browser)
- **Backend**: Simple Express server (serves static files + YouTube oEmbed)
- **Video Processing**: 100% client-side with FFmpeg WASM

## Features

- ✅ Upload videos from your device
- ✅ Auto-crop to 9:16 (vertical shorts)
- ✅ AI Smart Highlights
- ✅ Face tracking
- ✅ Video effects (filters, speed)
- ✅ Auto captions (Web Speech API)
- ✅ Translation (13 languages)
- ✅ YouTube URL support (via oEmbed for info)

## Limitations

- YouTube download requires yt-dlp (not available on Glitch)
- Users can upload videos directly instead
- All processing happens in browser

## Environment Variables

No environment variables needed for basic usage.
