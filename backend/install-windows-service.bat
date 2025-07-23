@echo off
echo ========================================
echo   Install Du Lich Tra Vinh as Windows Service
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing PM2...
    npm install -g pm2
    npm install -g pm2-windows-service
) else (
    echo ✅ PM2 already installed
    REM Check if pm2-windows-service is installed
    pm2-service-install --help >nul 2>&1
    if %errorlevel% neq 0 (
        echo 📦 Installing PM2 Windows Service...
        npm install -g pm2-windows-service
    )
)

echo.
echo 🔄 Setting up PM2 Windows Service...

REM Set PM2_HOME environment variable
set PM2_HOME=%USERPROFILE%\.pm2

REM Install PM2 as Windows Service
pm2-service-install -n "DuLichTraVinhAPI"

echo.
echo 🚀 Starting service...

REM Start the service
net start "DuLichTraVinhAPI"

REM Start the application with PM2
cd /d "%~dp0"
pm2 start pm2.config.js

REM Save PM2 configuration
pm2 save

echo.
echo ✅ Du Lich Tra Vinh API installed as Windows Service!
echo.
echo 📋 Service Management:
echo   net start "DuLichTraVinhAPI"    - Start service
echo   net stop "DuLichTraVinhAPI"     - Stop service
echo   net restart "DuLichTraVinhAPI"  - Restart service
echo.
echo 📊 Application Management:
echo   pm2 status                      - Check status
echo   pm2 logs dulich-travinh-api     - View logs
echo   pm2 monit                       - Real-time monitoring
echo.
echo 🔧 To uninstall service:
echo   net stop "DuLichTraVinhAPI"
echo   pm2-service-uninstall
echo.

pause
