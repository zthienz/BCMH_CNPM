@echo off
echo ========================================
echo   Du Lich Tra Vinh - Permanent Setup
echo ========================================
echo.

echo 🔧 Setting up permanent stability solutions...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install PM2 globally if not exists
echo 📦 Checking PM2 installation...
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ❌ Failed to install PM2
        pause
        exit /b 1
    )
    echo ✅ PM2 installed
) else (
    echo ✅ PM2 already installed
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist "logs" mkdir logs
echo ✅ Logs directory created

REM Check .env file
if not exist ".env" (
    echo ❌ .env file not found
    echo Please create .env file first
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
)

REM Setup database if needed
echo 🗄️ Checking database setup...
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        await conn.execute('SELECT 1 FROM TaiKhoanNguoiDung LIMIT 1');
        await conn.end();
        console.log('✅ Database is ready');
    } catch (error) {
        console.log('⚠️ Database needs setup');
        process.exit(1);
    }
})();
"

if %errorlevel% neq 0 (
    echo 🔧 Setting up database...
    node setup-complete-database.js
    if %errorlevel% neq 0 (
        echo ❌ Database setup failed
        pause
        exit /b 1
    )
    echo ✅ Database setup completed
)

echo.
echo 🎯 Choose your preferred startup method:
echo.
echo 1. Windows Service (Recommended - Survives reboots)
echo 2. PM2 Process Manager (Good for development)
echo 3. Auto-restart Monitor (Simple monitoring)
echo 4. Manual startup
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo 🔧 Installing Windows Service...
    call install-windows-service.bat
) else if "%choice%"=="2" (
    echo 🚀 Starting with PM2...
    call start-permanent.bat
) else if "%choice%"=="3" (
    echo 🔍 Starting auto-restart monitor...
    call auto-restart.bat
) else if "%choice%"=="4" (
    echo 📋 Manual startup instructions:
    echo   node restful-api-server.js
    echo.
    echo 📊 System Dashboard: system-dashboard.html
    echo 🔍 Health Check: http://localhost:3001/health
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo ✅ Permanent setup completed!
echo.
echo 📋 Management Commands:
echo   pm2 status                 - Check status
echo   pm2 logs dulich-travinh-api - View logs  
echo   pm2 restart dulich-travinh-api - Restart
echo   pm2 monit                  - Real-time monitoring
echo.
echo 🌐 Access Points:
echo   API: http://localhost:3001
echo   Health: http://localhost:3001/health
echo   Dashboard: system-dashboard.html
echo.

pause
