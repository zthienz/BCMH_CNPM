@echo off
echo ========================================
echo   Du Lich Tra Vinh - Production Server
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

REM Set production environment
set NODE_ENV=production

echo 🚀 Starting Du Lich Tra Vinh API Server in Production Mode...
echo.
echo 📍 Server will start on port 3001
echo 🔒 Security features enabled
echo 📊 Rate limiting active
echo 🚫 Debug logging disabled
echo.

REM Start the server
node restful-api-server.js

pause
