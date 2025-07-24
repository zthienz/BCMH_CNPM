@echo off
title Du Lich Tra Vinh - API Server
echo ========================================
echo   Du Lich Tra Vinh - API Server
echo ========================================
echo.

REM Change to backend directory
cd /d "D:\BCMH_CNPM\backend"

REM Kill any existing Node.js processes
echo 🔄 Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment
timeout /t 3 /nobreak >nul

echo 🚀 Starting API Server...
echo 📍 Server will be available at: http://localhost:3001
echo 🌐 Health check: http://localhost:3001/health
echo.
echo ⚠️  IMPORTANT: Keep this window open!
echo ⚠️  Do NOT close this window while using the website!
echo.
echo 📋 After server starts:
echo   1. Open VS Code
echo   2. Open frontend folder
echo   3. Right-click index.html → Open with Live Server
echo.

REM Start the server
node restful-api-server.js

echo.
echo ❌ Server stopped. Press any key to restart...
pause
goto :start
