@echo off
title Du Lich Tra Vinh - Service Mode
echo ========================================
echo   Du Lich Tra Vinh - Service Mode
echo ========================================
echo.

REM Change to backend directory
cd /d "D:\BCMH_CNPM\backend"

echo 🛡️ Starting Du Lich Tra Vinh in Service Mode...
echo 📊 Features:
echo   - Auto-restart on crashes
echo   - Health monitoring every 30s
echo   - Zombie process detection
echo   - Comprehensive logging
echo   - Graceful shutdown handling
echo.
echo 📍 Server will be available at: http://localhost:3001
echo 📋 Logs will be saved to: service.log
echo.
echo Press Ctrl+C to stop the service
echo.

REM Start the service wrapper
node service-wrapper.js

pause
