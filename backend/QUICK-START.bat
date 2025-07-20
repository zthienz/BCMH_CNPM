@echo off
color 0A
title Du Lich Tra Vinh - Quick Start
cls

echo ========================================
echo    DU LICH TRA VINH - QUICK START
echo ========================================
echo.
echo 🚀 Starting server on port 3001...
echo 💾 Database: dulichtravinh  
echo 🌐 CORS: Enabled for all origins
echo.
echo 📝 Test credentials:
echo    Email: vpt123@gmail.com
echo    Password: 123456
echo.

cd /d "%~dp0"

echo 🔄 Killing any existing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo    Killing PID %%a...
    taskkill /f /pid %%a 2>nul
)

echo.
echo 🔄 Starting server...
echo.
echo ========================================
echo   SERVER RUNNING - Press Ctrl+C to stop
echo ========================================

node simple-cors-server.js

echo.
echo ========================================
echo   SERVER STOPPED
echo ========================================
echo.
pause
