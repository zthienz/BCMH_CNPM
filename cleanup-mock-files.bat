@echo off
echo ========================================
echo   Cleanup Mock/Test Files
echo   Remove files using fake/mock data
echo ========================================
echo.

echo 🔍 This script will remove files that use mock/fake data
echo ✅ Files using real database will be kept
echo.

set /p CONFIRM="Are you sure you want to continue? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Operation cancelled
    pause
    exit /b 0
)

echo.
echo 🗑️ Removing mock/test files...
echo.

REM Frontend - Demo & Test Pages
echo 📁 Cleaning frontend demo pages...
if exist "frontend\auth-demo.html" (
    del "frontend\auth-demo.html"
    echo ✅ Removed: auth-demo.html
)
if exist "frontend\nodejs-auth-test.html" (
    del "frontend\nodejs-auth-test.html"
    echo ✅ Removed: nodejs-auth-test.html
)
if exist "frontend\database-auth-test.html" (
    del "frontend\database-auth-test.html"
    echo ✅ Removed: database-auth-test.html
)
if exist "frontend\debug-chatbot.html" (
    del "frontend\debug-chatbot.html"
    echo ✅ Removed: debug-chatbot.html
)
if exist "frontend\admin-db.html" (
    del "frontend\admin-db.html"
    echo ✅ Removed: admin-db.html
)
if exist "frontend\admin-images.html" (
    del "frontend\admin-images.html"
    echo ✅ Removed: admin-images.html
)
if exist "frontend\chatbot-performance.html" (
    del "frontend\chatbot-performance.html"
    echo ✅ Removed: chatbot-performance.html
)
if exist "frontend\chatbot-status.html" (
    del "frontend\chatbot-status.html"
    echo ✅ Removed: chatbot-status.html
)
if exist "frontend\chatbot-inline.html" (
    del "frontend\chatbot-inline.html"
    echo ✅ Removed: chatbot-inline.html
)
if exist "frontend\api-key-manager.html" (
    del "frontend\api-key-manager.html"
    echo ✅ Removed: api-key-manager.html
)

REM Frontend - Unused Components
echo 📁 Cleaning frontend components...
if exist "frontend\components\ai-chatbot-enhanced.js" (
    del "frontend\components\ai-chatbot-enhanced.js"
    echo ✅ Removed: ai-chatbot-enhanced.js
)
if exist "frontend\components\chatbot-component.js" (
    del "frontend\components\chatbot-component.js"
    echo ✅ Removed: chatbot-component.js
)
if exist "frontend\components\chatbot-include.html" (
    del "frontend\components\chatbot-include.html"
    echo ✅ Removed: chatbot-include.html
)
if exist "frontend\components\chatbot-loader.js" (
    del "frontend\components\chatbot-loader.js"
    echo ✅ Removed: chatbot-loader.js
)
if exist "frontend\components\chatbot-simple.html" (
    del "frontend\components\chatbot-simple.html"
    echo ✅ Removed: chatbot-simple.html
)
if exist "frontend\components\chatbot-styles.css" (
    del "frontend\components\chatbot-styles.css"
    echo ✅ Removed: chatbot-styles.css
)
if exist "frontend\components\gemini-ai-service.js" (
    del "frontend\components\gemini-ai-service.js"
    echo ✅ Removed: gemini-ai-service.js (duplicate)
)
if exist "frontend\destinations.css" (
    del "frontend\destinations.css"
    echo ✅ Removed: destinations.css
)

REM Backend - Mock Servers
echo 📁 Cleaning backend mock servers...
if exist "backend\test-server.js" (
    del "backend\test-server.js"
    echo ✅ Removed: test-server.js
)
if exist "backend\server-with-db.js" (
    del "backend\server-with-db.js"
    echo ✅ Removed: server-with-db.js
)
if exist "backend\server.js" (
    del "backend\server.js"
    echo ✅ Removed: server.js
)
if exist "backend\test-db-connection.js" (
    del "backend\test-db-connection.js"
    echo ✅ Removed: test-db-connection.js
)

REM Backend - PHP Files
echo 📁 Cleaning PHP files...
if exist "backend\api\auth.php" (
    del "backend\api\auth.php"
    echo ✅ Removed: auth.php
)
if exist "backend\config\database.php" (
    del "backend\config\database.php"
    echo ✅ Removed: database.php
)
if exist "backend\includes\functions.php" (
    del "backend\includes\functions.php"
    echo ✅ Removed: functions.php
)

REM Backend - Unused SQL
echo 📁 Cleaning unused SQL files...
if exist "backend\database\auth_tables.sql" (
    del "backend\database\auth_tables.sql"
    echo ✅ Removed: auth_tables.sql
)
if exist "backend\database\setup.sql" (
    del "backend\database\setup.sql"
    echo ✅ Removed: setup.sql
)

REM Remove empty directories
echo 📁 Cleaning empty directories...
if exist "backend\api" (
    rmdir "backend\api" 2>nul
    if not exist "backend\api" echo ✅ Removed: backend\api directory
)
if exist "backend\includes" (
    rmdir "backend\includes" 2>nul
    if not exist "backend\includes" echo ✅ Removed: backend\includes directory
)

echo.
echo ✅ Cleanup completed!
echo.
echo 📊 Summary:
echo   ✅ Removed mock/test files
echo   ✅ Removed duplicate components  
echo   ✅ Removed PHP files
echo   ✅ Removed unused SQL files
echo   ✅ Kept all files using real database
echo.
echo 🔒 Files kept (using real database):
echo   ✅ frontend\index.html
echo   ✅ frontend\real-database-test.html
echo   ✅ frontend\components\auth-modal.js
echo   ✅ frontend\components\user-manager.js
echo   ✅ backend\server-db-only.js
echo   ✅ backend\create-database.sql
echo.
echo 🚀 Your website now only uses real database!
echo.

pause
