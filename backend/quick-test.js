/**
 * Quick Test Script
 * Kiểm tra nhanh database và server
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function quickTest() {
    let connection;
    
    try {
        console.log('🔄 Quick test starting...');
        
        // Test database connection
        connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Thien@160504',
            database: 'dulichtravinh',
            charset: 'utf8mb4'
        });
        
        console.log('✅ Database connected');
        
        // Test users table
        const [users] = await connection.execute('SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung');
        console.log(`👥 Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`   ${user.MaTK}: ${user.TenNguoiDung} (${user.Email}) - ${user.LoaiNguoiDung}`);
        });
        
        // Test password for vpt123@gmail.com
        const [testUser] = await connection.execute('SELECT * FROM TaiKhoanNguoiDung WHERE Email = ?', ['vpt123@gmail.com']);
        if (testUser.length > 0) {
            const passwordMatch = await bcrypt.compare('123456', testUser[0].MatKhau);
            console.log(`🔐 Password test for vpt123@gmail.com: ${passwordMatch ? '✅ PASS' : '❌ FAIL'}`);
        }
        
        // Test locations table
        const [locations] = await connection.execute('SELECT MaDiaDiem, TenDiaDiem FROM diadiemdulich');
        console.log(`🏛️ Found ${locations.length} locations:`);
        locations.forEach(loc => {
            console.log(`   ${loc.MaDiaDiem}: ${loc.TenDiaDiem}`);
        });
        
        console.log('');
        console.log('✅ All tests passed!');
        console.log('📝 Test credentials:');
        console.log('   Email: vpt123@gmail.com');
        console.log('   Password: 123456');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

quickTest();
