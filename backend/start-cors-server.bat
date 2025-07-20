@echo off
title CORS Server - Port 3001
echo ========================================
echo   Starting CORS-enabled Server
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Killing any existing Node.js processes on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a 2>nul
echo.
echo Starting server...
node simple-cors-server.js
echo.
echo Server stopped. Press any key to exit...
pause > nul
