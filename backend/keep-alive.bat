@echo off
title Du Lich Tra Vinh - Keep Alive Monitor
echo ========================================
echo   Du Lich Tra Vinh - Keep Alive Monitor
echo ========================================
echo.
echo 🔍 Starting keep-alive monitor...
echo 📍 Monitoring: http://localhost:3001/health
echo ⏱️  Check interval: 30 seconds
echo 🔄 Auto-restart: Enabled
echo 🛡️ Zombie process detection: Enabled
echo.
echo Press Ctrl+C to stop monitoring
echo.

:loop
echo [%date% %time%] Checking server health...

REM Check if server is responding
curl -s -f http://localhost:3001/health >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Server is healthy
) else (
    echo ❌ Server is not responding - Restarting...

    REM Kill any existing Node.js processes (including zombies)
    taskkill /f /im node.exe >nul 2>&1

    REM Also kill by port (in case of zombie processes)
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>&1
    )

    REM Wait for cleanup
    timeout /t 5 /nobreak >nul

    REM Verify port is free
    netstat -ano | findstr :3001 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ⚠️ Port still occupied, waiting longer...
        timeout /t 10 /nobreak >nul
    )

    REM Start server in background
    start /min "DuLichTraVinh-API" node restful-api-server.js

    REM Wait for server to start
    timeout /t 15 /nobreak >nul

    REM Verify server started
    curl -s -f http://localhost:3001/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Server restarted successfully
    ) else (
        echo ⚠️ Server may need more time to start
    )
)

REM Wait 30 seconds before next check
timeout /t 30 /nobreak >nul

goto loop
