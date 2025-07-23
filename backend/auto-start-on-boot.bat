@echo off
title Du Lich Tra Vinh - Auto Start
echo ========================================
echo   Du Lich Tra Vinh - Auto Start on Boot
echo ========================================
echo.

REM Change to backend directory
cd /d "D:\BCMH_CNPM\backend"

REM Wait for system to fully boot and network to be ready
echo ⏳ Waiting for system to fully boot...
timeout /t 45 /nobreak >nul

REM Wait for network to be ready
echo 🌐 Waiting for network connectivity...
:network_check
ping -n 1 127.0.0.1 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    goto network_check
)

REM Kill any existing Node.js processes
echo 🔄 Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1

REM Also kill by port (in case of zombie processes)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Wait for cleanup
timeout /t 5 /nobreak >nul

REM Verify Node.js is available
echo 🔍 Checking Node.js availability...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found in PATH
    echo Please ensure Node.js is installed and in system PATH
    pause
    exit /b 1
)

REM Start the server with infinite restart protection
echo 🚀 Starting Du Lich Tra Vinh API Server...
echo 📍 Server will be available at: http://localhost:3001
echo 🔍 Infinite restart protection: Enabled
echo 🛡️ Auto-recovery: Enabled
echo.

:infinite_restart
echo 🔄 Starting robust monitor...
call simple-monitor.bat

REM If monitor exits for any reason, restart it
echo ⚠️ Monitor stopped. Restarting in 10 seconds...
timeout /t 10 /nobreak >nul
goto infinite_restart
