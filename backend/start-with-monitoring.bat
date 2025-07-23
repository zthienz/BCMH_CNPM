@echo off
echo ========================================
echo   Du Lich Tra Vinh - Server with Health Monitoring
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

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo Please create .env file with required configuration
    pause
    exit /b 1
)

echo 🔍 Starting Du Lich Tra Vinh API Server with Health Monitoring...
echo.
echo 📍 Server will start on port 3001
echo 🔍 Health monitoring active
echo 🔄 Auto-restart on failures
echo 📊 Performance monitoring enabled
echo.
echo Press Ctrl+C to stop both server and monitor
echo.

REM Start the health monitor (which will start the server)
node health-monitor.js

pause
