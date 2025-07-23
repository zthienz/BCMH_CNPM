@echo off
echo ========================================
echo   Du Lich Tra Vinh - Permanent Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PM2 is installed globally
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 PM2 not found. Installing PM2 globally...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ❌ Failed to install PM2
        pause
        exit /b 1
    )
    echo ✅ PM2 installed successfully
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo Please create .env file with required configuration
    pause
    exit /b 1
)

echo 🔄 Stopping any existing instances...
pm2 delete dulich-travinh-api >nul 2>&1

echo 🚀 Starting Du Lich Tra Vinh API with PM2...
pm2 start pm2.config.js

echo.
echo 📊 Server Status:
pm2 status

echo.
echo 📋 Available Commands:
echo   pm2 status                 - Check server status
echo   pm2 logs dulich-travinh-api - View logs
echo   pm2 restart dulich-travinh-api - Restart server
echo   pm2 stop dulich-travinh-api - Stop server
echo   pm2 delete dulich-travinh-api - Remove from PM2
echo   pm2 monit                  - Real-time monitoring
echo.

echo ✅ Server started with permanent monitoring!
echo 🌐 Access: http://localhost:3001
echo 📊 Monitor: pm2 monit
echo.

REM Ask if user wants to open monitoring
set /p monitor="Open PM2 monitoring dashboard? (y/n): "
if /i "%monitor%"=="y" (
    start cmd /k "pm2 monit"
)

pause
