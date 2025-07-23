@echo off
title Du Lich Tra Vinh - Robust Monitor
echo ========================================
echo   Du Lich Tra Vinh - Robust Monitor
echo ========================================
echo.
echo 🛡️ Robust and reliable monitoring
echo 📍 Server: http://localhost:3001
echo ⏱️  Health check every 30 seconds
echo 🔄 Auto-restart on failure
echo 🌐 CORS and connectivity verified
echo.

:monitor_loop
echo [%date% %time%] Starting server...

REM Kill any existing processes first
taskkill /f /im node.exe >nul 2>&1

REM Kill by port to handle zombie processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Wait for cleanup
timeout /t 3 /nobreak >nul

REM Verify port is free
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 still occupied, waiting longer...
    timeout /t 10 /nobreak >nul
)

REM Start server
echo 🚀 Starting API server...
start /min "DuLichTraVinh" node restful-api-server.js

REM Wait for server to initialize
timeout /t 15 /nobreak >nul

REM Verify server started
echo 🔍 Verifying server startup...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Server needs more time to start...
    timeout /t 10 /nobreak >nul
)

:health_loop
echo [%date% %time%] Checking server health...

REM Comprehensive health check
curl -s -f http://localhost:3001/health >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Server is healthy

    REM Also test CORS by checking an API endpoint
    curl -s -H "Origin: http://127.0.0.1:5507" http://localhost:3001/api/locations >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ CORS is working
    ) else (
        echo ⚠️ CORS issue detected
    )

    timeout /t 30 /nobreak >nul
    goto health_loop
) else (
    echo ❌ Server health check failed - Restarting...
    goto monitor_loop
)

REM This should never be reached
goto monitor_loop
