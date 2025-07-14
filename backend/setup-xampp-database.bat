@echo off
echo ========================================
echo   Database Setup for XAMPP/MySQL
echo ========================================
echo.

echo 🔍 Checking for XAMPP installation...

REM Check common XAMPP paths
set XAMPP_PATH=""
if exist "C:\xampp\mysql\bin\mysql.exe" set XAMPP_PATH=C:\xampp\mysql\bin
if exist "D:\xampp\mysql\bin\mysql.exe" set XAMPP_PATH=D:\xampp\mysql\bin
if exist "C:\Program Files\XAMPP\mysql\bin\mysql.exe" set XAMPP_PATH=C:\Program Files\XAMPP\mysql\bin

if %XAMPP_PATH%=="" (
    echo ❌ XAMPP MySQL not found!
    echo.
    echo 📝 Please do one of the following:
    echo   1. Install XAMPP from https://www.apachefriends.org/
    echo   2. Start XAMPP Control Panel and start MySQL
    echo   3. Use MySQL Workbench to run: create-database.sql
    echo   4. Update .env file with correct database credentials
    echo.
    pause
    exit /b 1
)

echo ✅ Found XAMPP MySQL at: %XAMPP_PATH%

echo.
echo 🚀 Starting database setup...
echo.

REM Add XAMPP MySQL to PATH temporarily
set PATH=%XAMPP_PATH%;%PATH%

echo 📝 Creating database and tables...
echo.

REM Try to connect without password first (default XAMPP)
mysql -u root -e "SELECT 'Testing connection...' as status;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Connected to MySQL without password
    echo.
    echo 📊 Creating database...
    mysql -u root < create-database.sql
    if %errorlevel% equ 0 (
        echo ✅ Database setup completed successfully!
        echo.
        echo 📋 Database created: dulich_travinh
        echo 📋 Tables created: TaiKhoanNguoiDung, HoatDongNguoiDung, sessions
        echo.
        echo 👤 Sample accounts:
        echo   Admin: admin@travinh-travel.com / admin123
        echo   User:  user@example.com / user123
        echo.
        echo 🔧 Updating .env file...
        
        REM Update .env file for no password
        powershell -Command "(Get-Content .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=' | Set-Content .env"
        
        echo ✅ .env file updated for XAMPP (no password)
        echo.
        echo 🚀 You can now start the server:
        echo   node server-db-only.js
        echo.
    ) else (
        echo ❌ Database setup failed!
    )
) else (
    echo ⚠️  Connection without password failed
    echo.
    set /p MYSQL_PASSWORD="Enter MySQL root password (or press Enter if no password): "
    
    if "%MYSQL_PASSWORD%"=="" (
        echo ❌ Could not connect to MySQL
        echo.
        echo 📝 Please check:
        echo   1. XAMPP Control Panel - MySQL is started
        echo   2. MySQL service is running
        echo   3. No password is set for root user
        echo.
    ) else (
        mysql -u root -p%MYSQL_PASSWORD% < create-database.sql
        if %errorlevel% equ 0 (
            echo ✅ Database setup completed successfully!
            echo.
            echo 🔧 Updating .env file...
            powershell -Command "(Get-Content .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%MYSQL_PASSWORD%' | Set-Content .env"
            echo ✅ .env file updated with password
            echo.
        ) else (
            echo ❌ Database setup failed with password
        )
    )
)

echo.
echo 📝 Next steps:
echo   1. Start the Node.js server: node server-db-only.js
echo   2. Test the authentication on the web page
echo   3. Check http://localhost:3000/health for status
echo.

pause
