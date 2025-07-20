@echo off
color 0A
title Du Lich Tra Vinh - RESTful API Server
cls

echo ========================================
echo    DU LICH TRA VINH - RESTful API
echo ========================================
echo.
echo 🚀 Starting RESTful API server on port 3001...
echo 💾 Database: dulichtravinh  
echo 🌐 CORS: Enabled for all origins
echo 🔐 JWT: Authentication enabled
echo 📁 File Upload: Enabled (5MB limit)
echo.
echo 📋 Available Endpoints:
echo    GET  /health - Health check
echo    GET  /api/info - API documentation
echo    POST /api/auth/* - Authentication
echo    GET^|POST^|PUT^|DELETE /api/users/* - User management
echo    GET^|POST^|PUT^|DELETE /api/locations/* - Location management
echo    POST /api/uploads/* - File upload
echo.
echo 📝 Test credentials:
echo    Email: vpt123@gmail.com
echo    Password: 123456
echo.
echo 🔗 Test URLs:
echo    Health: http://localhost:3001/health
echo    API Info: http://localhost:3001/api/info
echo    Website: file:///d:/BCMH_CNPM/frontend/index.html
echo.

cd /d "%~dp0"

echo 🔄 Stopping any existing Node.js processes...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force" 2>nul

echo.
echo 🔄 Starting RESTful API server...
echo.
echo ========================================
echo   SERVER RUNNING - Press Ctrl+C to stop
echo ========================================

node restful-api-server.js

echo.
echo ========================================
echo   SERVER STOPPED
echo ========================================
echo.
pause
