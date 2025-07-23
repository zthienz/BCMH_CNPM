@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Du Lich Tra Vinh - Auto Restart Monitor
echo ========================================
echo.

set MAX_RESTARTS=10
set RESTART_COUNT=0
set CHECK_INTERVAL=30
set API_URL=http://localhost:3001/health

echo 🔍 Starting auto-restart monitor...
echo 📍 Monitoring: %API_URL%
echo ⏱️  Check interval: %CHECK_INTERVAL% seconds
echo 🔄 Max restarts: %MAX_RESTARTS%
echo.

:MONITOR_LOOP
    echo [%date% %time%] Checking server health...
    
    REM Check if server is responding
    curl -s -f %API_URL% >nul 2>&1
    
    if !errorlevel! equ 0 (
        echo ✅ Server is healthy
        set RESTART_COUNT=0
    ) else (
        echo ❌ Server is not responding
        
        if !RESTART_COUNT! geq %MAX_RESTARTS% (
            echo ❌ Maximum restart attempts reached. Stopping monitor.
            echo 📧 Please check the server manually.
            pause
            exit /b 1
        )
        
        set /a RESTART_COUNT+=1
        echo 🔄 Restarting server (attempt !RESTART_COUNT!/%MAX_RESTARTS%)...
        
        REM Kill any existing Node.js processes on port 3001
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
            taskkill /PID %%a /F >nul 2>&1
        )
        
        REM Wait a moment
        timeout /t 5 /nobreak >nul
        
        REM Start server
        start /min "DuLichTraVinh-API" node restful-api-server.js
        
        REM Wait for server to start
        timeout /t 10 /nobreak >nul
        
        echo ✅ Server restart completed
    )
    
    REM Wait before next check
    timeout /t %CHECK_INTERVAL% /nobreak >nul
    
goto MONITOR_LOOP
