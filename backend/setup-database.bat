@echo off
echo ========================================
echo   Database Setup for Tra Vinh Travel
echo ========================================
echo.

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed or not in PATH!
    echo Please install MySQL and add it to your PATH
    echo Or use MySQL Workbench to run the SQL script manually
    echo.
    echo SQL script location: database/setup.sql
    pause
    exit /b 1
)

echo ✅ MySQL is available
mysql --version

echo.
echo 🔄 Setting up database...
echo.

REM Prompt for MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD="Enter MySQL password (leave empty if no password): "

echo.
echo 📝 Running database setup script...
echo.

REM Run the SQL script
if "%MYSQL_PASSWORD%"=="" (
    mysql -u %MYSQL_USER% < database/setup.sql
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% < database/setup.sql
)

if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    echo Please check your MySQL credentials and try again
    echo.
    echo You can also run the SQL script manually:
    echo 1. Open MySQL Workbench or command line
    echo 2. Run the script: database/setup.sql
    pause
    exit /b 1
)

echo.
echo ✅ Database setup completed successfully!
echo.
echo 📋 Created:
echo   - Database: dulich_travinh
echo   - Table: TaiKhoanNguoiDung
echo   - Table: HoatDongNguoiDung  
echo   - Table: sessions
echo   - Table: diadiemdulich
echo.
echo 👤 Sample accounts created:
echo   Admin: admin@travinh-travel.com / admin123
echo   User:  user@example.com / user123
echo.
echo 🔧 Next steps:
echo   1. Update .env file with your database credentials
echo   2. Start the server: npm start
echo.

pause
