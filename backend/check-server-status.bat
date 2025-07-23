@echo off
title Server Status Check
echo ========================================
echo   Du Lich Tra Vinh - Server Status
echo ========================================
echo.

echo 🔍 Checking server status...
echo.

REM Check if port 3001 is listening
echo 📡 Port 3001 status:
netstat -ano | findstr :3001
if %errorlevel% equ 0 (
    echo ✅ Port 3001 is active
) else (
    echo ❌ Port 3001 is not listening
)
echo.

REM Check Node.js processes
echo 🟢 Node.js processes:
tasklist | findstr node.exe
if %errorlevel% equ 0 (
    echo ✅ Node.js processes found
) else (
    echo ❌ No Node.js processes running
)
echo.

REM Test health endpoint
echo 🏥 Health endpoint test:
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Health endpoint responding
    curl -s http://localhost:3001/health
) else (
    echo ❌ Health endpoint not responding
)
echo.

REM Test CORS
echo 🌐 CORS test:
curl -s -H "Origin: http://127.0.0.1:5507" http://localhost:3001/api/locations >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ CORS is working
) else (
    echo ❌ CORS issue detected
)
echo.

REM Test website connectivity
echo 🌍 Website connectivity test:
curl -s http://127.0.0.1:5507 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend server accessible
) else (
    echo ⚠️ Frontend server may not be running (Live Server)
)
echo.

echo 📋 Summary:
echo   - API Server: http://localhost:3001
echo   - Frontend: http://127.0.0.1:5507
echo   - Health: http://localhost:3001/health
echo.

pause
