/**
 * Test Database Connection Script
 * Kiểm tra kết nối database và bảng TaiKhoanNguoiDung
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Thien@160504',
    database: process.env.DB_NAME || 'dulichtravinh',
    charset: 'utf8mb4'
};

async function testDatabase() {
    let connection;
    
    try {
        console.log('🔄 Testing database connection...');
        console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`📊 Database: ${dbConfig.database}`);
        console.log(`👤 User: ${dbConfig.user}`);
        console.log('');

        // Create connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful');

        // Test basic query
        const [testResult] = await connection.execute('SELECT 1 as test');
        console.log('✅ Basic query test passed');

        // Check if TaiKhoanNguoiDung table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'TaiKhoanNguoiDung'");
        
        if (tables.length === 0) {
            console.log('❌ Table TaiKhoanNguoiDung not found');
            console.log('📝 Creating table...');
            
            const createTableSQL = `
                CREATE TABLE TaiKhoanNguoiDung (
                    MaTK VARCHAR(10) PRIMARY KEY,
                    TenNguoiDung VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL,
                    Email VARCHAR(100) NOT NULL UNIQUE,
                    MatKhau VARCHAR(255) NOT NULL,
                    LoaiNguoiDung ENUM('Admin','Khach') NOT NULL DEFAULT 'Khach'
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;
            
            await connection.execute(createTableSQL);
            console.log('✅ Table TaiKhoanNguoiDung created successfully');
        } else {
            console.log('✅ Table TaiKhoanNguoiDung found');
        }

        // Show table structure
        const [columns] = await connection.execute('DESCRIBE TaiKhoanNguoiDung');
        console.log('📋 Table structure:');
        columns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Key === 'UNI' ? 'UNIQUE' : ''}`);
        });

        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM TaiKhoanNguoiDung');
        console.log(`📊 Total users: ${userCount[0].count}`);

        // Show all users (without passwords)
        if (userCount[0].count > 0) {
            const [users] = await connection.execute('SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung');
            console.log('👥 Users in database:');
            users.forEach(user => {
                console.log(`   ${user.MaTK}: ${user.TenNguoiDung} (${user.Email}) - ${user.LoaiNguoiDung}`);
            });
        } else {
            console.log('📝 No users found. You may need to create sample users.');
        }

        console.log('');
        console.log('✅ Database test completed successfully!');
        console.log('🚀 You can now start the server with: node server-fixed.js');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Suggestions:');
            console.log('   - Make sure MySQL/XAMPP is running');
            console.log('   - Check if the port 3306 is correct');
            console.log('   - Verify the host is accessible');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Suggestions:');
            console.log('   - Check username and password in .env file');
            console.log('   - Make sure the user has proper permissions');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Suggestions:');
            console.log('   - Create the database "dulichtravinh" first');
            console.log('   - Or update DB_NAME in .env file');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run test
testDatabase();
