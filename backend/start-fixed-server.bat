@echo off
echo ========================================
echo   Starting Fixed Database Server
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting Node.js server with database connection...
node fixed-cors-server.js
echo.
echo Server stopped. Press any key to exit...
pause > nul
