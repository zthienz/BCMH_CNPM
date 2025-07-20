/**
 * Add Test User Script
 * Thêm user test vào database
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Thien@160504',
    database: process.env.DB_NAME || 'dulichtravinh',
    charset: 'utf8mb4'
};

async function addTestUser() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check if test user already exists
        const [existing] = await connection.execute(
            'SELECT Email FROM TaiKhoanNguoiDung WHERE Email = ?',
            ['vpt123@gmail.com']
        );

        if (existing.length > 0) {
            console.log('⚠️ Test user vpt123@gmail.com already exists');
            
            // Update password to plain text for testing
            const hashedPassword = await bcrypt.hash('123456', 12);
            await connection.execute(
                'UPDATE TaiKhoanNguoiDung SET MatKhau = ? WHERE Email = ?',
                [hashedPassword, 'vpt123@gmail.com']
            );
            console.log('✅ Updated password for test user');
        } else {
            // Add new test user
            const hashedPassword = await bcrypt.hash('123456', 12);
            
            await connection.execute(
                'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
                ['TK03', 'Test User', 'vpt123@gmail.com', hashedPassword, 'Khach']
            );
            console.log('✅ Added test user: vpt123@gmail.com');
        }

        // Show all users
        const [users] = await connection.execute('SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung');
        console.log('\n👥 All users in database:');
        users.forEach(user => {
            console.log(`   ${user.MaTK}: ${user.TenNguoiDung} (${user.Email}) - ${user.LoaiNguoiDung}`);
        });

        console.log('\n📝 Test credentials:');
        console.log('   Email: vpt123@gmail.com');
        console.log('   Password: 123456');
        console.log('\n✅ Test user setup completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

addTestUser();
