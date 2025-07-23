@echo off
title Test Auto Start
echo ========================================
echo   Test Auto Start Functionality
echo ========================================
echo.

echo 🧪 Testing auto-start functionality...
echo.

REM Kill any existing processes
echo 🔄 Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo 🚀 Starting auto-start script...
echo.
echo This will simulate what happens when Windows boots:
echo 1. Wait for system to be ready
echo 2. Clean up old processes
echo 3. Start server with monitoring
echo 4. Verify health and CORS
echo.

REM Start the auto-start script
call auto-start-on-boot.bat
