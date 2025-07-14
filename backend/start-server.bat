@echo off
echo ========================================
echo   Tra Vinh Travel Backend Server
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version

REM Check if package.json exists
if not exist package.json (
    echo ❌ package.json not found!
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

echo.
echo 🔄 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo Creating .env file with default values...
    echo.
    copy .env.example .env >nul 2>&1
    if not exist .env (
        echo # Server Configuration > .env
        echo PORT=3000 >> .env
        echo NODE_ENV=development >> .env
        echo. >> .env
        echo # Database Configuration >> .env
        echo DB_HOST=localhost >> .env
        echo DB_PORT=3306 >> .env
        echo DB_NAME=dulich_travinh >> .env
        echo DB_USER=root >> .env
        echo DB_PASSWORD= >> .env
        echo. >> .env
        echo # Session Configuration >> .env
        echo SESSION_SECRET=your-super-secret-session-key-change-this-in-production >> .env
    )
    echo ✅ .env file created with default values
    echo ⚠️  Please update database credentials in .env file
    echo.
)

echo 🚀 Starting server...
echo.
echo Server will be available at:
echo   - http://localhost:3000
echo   - Health check: http://localhost:3000/health
echo   - API docs: http://localhost:3000/api/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start

pause
