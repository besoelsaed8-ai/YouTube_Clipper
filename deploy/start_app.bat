@echo off
title YouTube Clipper - Local Development
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║     YouTube Clipper - Dev Mode       ║
echo  ╚══════════════════════════════════════╝
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "server\node_modules" (
    echo [SETUP] Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo [SETUP] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo [1/2] Starting Server on http://localhost:3000...
start "YouTube Clipper - Server" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Client on http://localhost:5173...
start "YouTube Clipper - Client" cmd /k "cd client && npm run dev"

echo.
echo  ╔══════════════════════════════════════╗
echo  ║       Both servers are starting!     ║
echo  ╚══════════════════════════════════════╝
echo.
echo  ┌─────────────────────────────────────┐
echo  │  Open in browser:                   │
echo  │  → http://localhost:5173             │
echo  └─────────────────────────────────────┘
echo.
echo  HOW TO TEST:
echo  ─────────────────────────────────────
echo.
echo  📁 FILE UPLOAD (works immediately):
echo     1. Open http://localhost:5173
echo     2. Click "Click to upload"
echo     3. Select any video file from your PC
echo     4. Click "Analyze Video"
echo     5. Choose settings and process!
echo.
echo  🔗 YOUTUBE URL (needs server):
echo     1. Paste a YouTube link
echo     2. Click "Analyze Video"
echo     3. Note: YouTube may block server requests
echo        If so, download the video first and upload it
echo.
echo  ─────────────────────────────────────
echo.
echo  Press any key to open browser...
pause >nul
start http://localhost:5173
