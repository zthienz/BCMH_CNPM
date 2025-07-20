/**
 * Complete Database Setup Script
 * Tái tạo hoàn toàn database và dữ liệu
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Thien@160504',
    charset: 'utf8mb4'
};

const DATABASE_NAME = 'dulichtravinh';

async function setupCompleteDatabase() {
    let connection;
    
    try {
        console.log('🔄 Setting up complete database...');
        console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`👤 User: ${dbConfig.user}`);
        console.log('');

        // Connect without database first
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server');

        // Drop and recreate database
        console.log(`🗑️ Dropping database ${DATABASE_NAME} if exists...`);
        await connection.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}`);

        console.log(`📊 Creating database ${DATABASE_NAME}...`);
        await connection.query(`CREATE DATABASE ${DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        console.log(`🔗 Using database ${DATABASE_NAME}...`);
        await connection.query(`USE ${DATABASE_NAME}`);

        // Create TaiKhoanNguoiDung table
        console.log('📋 Creating TaiKhoanNguoiDung table...');
        const createUserTableSQL = `
            CREATE TABLE TaiKhoanNguoiDung (
                MaTK VARCHAR(10) PRIMARY KEY,
                TenNguoiDung VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL,
                Email VARCHAR(100) NOT NULL UNIQUE,
                MatKhau VARCHAR(255) NOT NULL,
                LoaiNguoiDung ENUM('Admin','Khach') NOT NULL DEFAULT 'Khach',
                NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
                LanDangNhapCuoi DATETIME NULL,
                TrangThai ENUM('Active','Inactive') DEFAULT 'Active',
                INDEX idx_email (Email),
                INDEX idx_loai (LoaiNguoiDung),
                INDEX idx_trangthai (TrangThai)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await connection.query(createUserTableSQL);
        console.log('✅ TaiKhoanNguoiDung table created');

        // Create sample users
        console.log('👥 Creating sample users...');
        const sampleUsers = [
            {
                MaTK: 'TK001',
                TenNguoiDung: 'Administrator',
                Email: 'admin@travinh-travel.com',
                MatKhau: await bcrypt.hash('admin123', 12),
                LoaiNguoiDung: 'Admin'
            },
            {
                MaTK: 'TK002',
                TenNguoiDung: 'Test User',
                Email: 'vpt123@gmail.com',
                MatKhau: await bcrypt.hash('123456', 12),
                LoaiNguoiDung: 'Khach'
            },
            {
                MaTK: 'TK003',
                TenNguoiDung: 'Demo User',
                Email: 'user@example.com',
                MatKhau: await bcrypt.hash('user123', 12),
                LoaiNguoiDung: 'Khach'
            },
            {
                MaTK: 'TK004',
                TenNguoiDung: 'Nguyễn Văn A',
                Email: 'nguyenvana@gmail.com',
                MatKhau: await bcrypt.hash('password123', 12),
                LoaiNguoiDung: 'Khach'
            }
        ];

        for (const user of sampleUsers) {
            await connection.execute(
                'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
                [user.MaTK, user.TenNguoiDung, user.Email, user.MatKhau, user.LoaiNguoiDung]
            );
            console.log(`   ✅ Created: ${user.Email} (${user.LoaiNguoiDung})`);
        }

        // Create diadiemdulich table (for tourism locations)
        console.log('🏛️ Creating diadiemdulich table...');
        const createLocationTableSQL = `
            CREATE TABLE diadiemdulich (
                MaDiaDiem VARCHAR(10) PRIMARY KEY,
                TenDiaDiem VARCHAR(200) CHARACTER SET utf8mb4 NOT NULL,
                MoTa TEXT CHARACTER SET utf8mb4,
                DiaChi VARCHAR(300) CHARACTER SET utf8mb4,
                ToaDo VARCHAR(50),
                LoaiDiaDiem ENUM('DiTich','ChuaDen','KhuDuLich','AmThuc','KhachSan') NOT NULL,
                GiaVe DECIMAL(10,2) DEFAULT 0,
                ThoiGianMoCua VARCHAR(100),
                HinhAnh VARCHAR(500),
                LuotXem INT DEFAULT 0,
                DanhGia DECIMAL(2,1) DEFAULT 0,
                TrangThai ENUM('Active','Inactive') DEFAULT 'Active',
                NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_loai (LoaiDiaDiem),
                INDEX idx_trangthai (TrangThai),
                INDEX idx_danhgia (DanhGia)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await connection.query(createLocationTableSQL);
        console.log('✅ diadiemdulich table created');

        // Insert sample locations
        console.log('🏛️ Creating sample locations...');
        const sampleLocations = [
            {
                MaDiaDiem: 'DD001',
                TenDiaDiem: 'Ao Bà Om',
                MoTa: 'Ao Bà Om là một trong những địa điểm du lịch nổi tiếng nhất của tỉnh Trà Vinh',
                DiaChi: 'Xã Định An, huyện Trà Cú, tỉnh Trà Vinh',
                LoaiDiaDiem: 'KhuDuLich',
                GiaVe: 20000,
                ThoiGianMoCua: '6:00 - 18:00',
                DanhGia: 4.5
            },
            {
                MaDiaDiem: 'DD002',
                TenDiaDiem: 'Chùa Âng',
                MoTa: 'Chùa Âng là ngôi chùa Khmer cổ kính và linh thiêng',
                DiaChi: 'Thành phố Trà Vinh, tỉnh Trà Vinh',
                LoaiDiaDiem: 'ChuaDen',
                GiaVe: 0,
                ThoiGianMoCua: '5:00 - 19:00',
                DanhGia: 4.2
            },
            {
                MaDiaDiem: 'DD003',
                TenDiaDiem: 'Bảo tàng Văn hóa Khmer',
                MoTa: 'Bảo tàng trưng bày văn hóa truyền thống của đồng bào Khmer',
                DiaChi: 'Thành phố Trà Vinh, tỉnh Trà Vinh',
                LoaiDiaDiem: 'DiTich',
                GiaVe: 10000,
                ThoiGianMoCua: '8:00 - 17:00',
                DanhGia: 4.0
            }
        ];

        for (const location of sampleLocations) {
            await connection.execute(
                'INSERT INTO diadiemdulich (MaDiaDiem, TenDiaDiem, MoTa, DiaChi, LoaiDiaDiem, GiaVe, ThoiGianMoCua, DanhGia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [location.MaDiaDiem, location.TenDiaDiem, location.MoTa, location.DiaChi, location.LoaiDiaDiem, location.GiaVe, location.ThoiGianMoCua, location.DanhGia]
            );
            console.log(`   ✅ Created location: ${location.TenDiaDiem}`);
        }

        // Show final results
        console.log('');
        console.log('📊 Database setup completed!');
        
        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM TaiKhoanNguoiDung');
        console.log(`👥 Total users: ${userCount[0].count}`);
        
        // Count locations
        const [locationCount] = await connection.execute('SELECT COUNT(*) as count FROM diadiemdulich');
        console.log(`🏛️ Total locations: ${locationCount[0].count}`);

        // Show users
        const [users] = await connection.execute('SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung ORDER BY MaTK');
        console.log('\n👥 Users created:');
        users.forEach(user => {
            console.log(`   ${user.MaTK}: ${user.TenNguoiDung} (${user.Email}) - ${user.LoaiNguoiDung}`);
        });

        console.log('\n📝 Test credentials:');
        console.log('   Admin: admin@travinh-travel.com / admin123');
        console.log('   User:  vpt123@gmail.com / 123456');
        console.log('   Demo:  user@example.com / user123');

        console.log('\n✅ Database setup completed successfully!');
        console.log('🚀 You can now start the server!');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure MySQL/XAMPP is running');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Check username and password in .env file');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

setupCompleteDatabase();
