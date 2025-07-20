/**
 * Fixed Server with Correct Database Schema
 * Connects to TaiKhoanNguoiDung table with proper structure
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Thien@160504',
    database: process.env.DB_NAME || 'dulichtravinh',
    charset: 'utf8mb4',
    timezone: '+07:00'
};

let pool;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow all file:// origins
        if (origin.startsWith('file://')) return callback(null, true);

        // Allow specific origins
        const allowedOrigins = [
            'http://localhost:3001',
            'http://127.0.0.1:5500',
            'http://localhost:5500',
            'http://127.0.0.1:3001'
        ];

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // For development, allow all origins
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Initialize database connection
async function initDatabase() {
    try {
        console.log('🔄 Connecting to MySQL database...');
        console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`📊 Database: ${dbConfig.database}`);
        console.log(`👤 User: ${dbConfig.user}`);
        
        pool = mysql.createPool(dbConfig);

        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful');
        
        // Test query
        await connection.execute('SELECT 1');
        console.log('✅ Database query test successful');
        
        // Check if TaiKhoanNguoiDung table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE ?', ['TaiKhoanNguoiDung']);
        if (tables.length === 0) {
            console.log('⚠️ TaiKhoanNguoiDung table not found, creating...');
            await createUserTable(connection);
        } else {
            console.log('✅ Table TaiKhoanNguoiDung found');
        }

        // Check table structure
        const [columns] = await connection.execute('DESCRIBE TaiKhoanNguoiDung');
        console.log('📋 Table structure:');
        columns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
        });

        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM TaiKhoanNguoiDung');
        console.log(`📊 Found ${userCount[0].count} users in database`);

        // Create sample users if table is empty
        if (userCount[0].count === 0) {
            await createSampleUsers(connection);
        }

        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
}

// Create TaiKhoanNguoiDung table
async function createUserTable(connection) {
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
    console.log('✅ TaiKhoanNguoiDung table created successfully');
}

// Create sample users
async function createSampleUsers(connection) {
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
        }
    ];

    for (const user of sampleUsers) {
        try {
            await connection.execute(
                'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
                [user.MaTK, user.TenNguoiDung, user.Email, user.MatKhau, user.LoaiNguoiDung]
            );
            console.log(`✅ Created sample user: ${user.Email}`);
        } catch (error) {
            console.log(`⚠️ Sample user ${user.Email} may already exist`);
        }
    }
}

// Generate unique MaTK
async function generateMaTK() {
    try {
        const [result] = await pool.execute('SELECT MAX(CAST(SUBSTRING(MaTK, 3) AS UNSIGNED)) as maxId FROM TaiKhoanNguoiDung WHERE MaTK LIKE "TK%"');
        const maxId = result[0].maxId || 0;
        const newId = maxId + 1;
        return `TK${newId.toString().padStart(3, '0')}`;
    } catch (error) {
        // Fallback to timestamp-based ID
        return `TK${Date.now().toString().slice(-6)}`;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        port: PORT,
        database: 'Connected',
        timestamp: new Date().toISOString()
    });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc'
            });
        }

        // Query database
        const [rows] = await pool.execute(
            'SELECT * FROM TaiKhoanNguoiDung WHERE Email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const user = rows[0];
        
        // Check password with bcrypt
        const passwordMatch = await bcrypt.compare(password, user.MatKhau);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        console.log('✅ Login successful for:', email);

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: user.MaTK,
                    name: user.TenNguoiDung,
                    email: user.Email,
                    type: user.LoaiNguoiDung
                }
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server nội bộ'
        });
    }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        console.log('📝 Register attempt:', email);
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc'
            });
        }

        // Check if email exists
        const [existing] = await pool.execute(
            'SELECT Email FROM TaiKhoanNguoiDung WHERE Email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Generate MaTK and hash password
        const maTK = await generateMaTK();
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert new user
        await pool.execute(
            'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
            [maTK, username, email, hashedPassword, 'Khach']
        );

        console.log('✅ Registration successful for:', email);

        res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: {
                    id: maTK,
                    name: username,
                    email: email,
                    type: 'Khach'
                }
            }
        });

    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server nội bộ'
        });
    }
});

// Session check endpoint
app.get('/api/auth/session', (req, res) => {
    res.json({
        success: true,
        data: {
            logged_in: false,
            user: null
        }
    });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

// Get all users (for testing)
app.get('/api/auth/users', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server nội bộ'
        });
    }
});

// Start server
async function startServer() {
    const dbConnected = await initDatabase();
    
    if (!dbConnected) {
        console.log('❌ Failed to connect to database. Exiting...');
        process.exit(1);
    }
    
    app.listen(PORT, () => {
        console.log('🚀 Server started successfully!');
        console.log(`📍 Server running on http://localhost:${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`💾 Database: MySQL Connected (Real Data)`);
        console.log('✅ Ready to accept connections\n');
        
        console.log('📝 Sample accounts (from database):');
        console.log('   Admin: admin@travinh-travel.com / admin123');
        console.log('   User:  vpt123@gmail.com / 123456');
        console.log('   Demo:  user@example.com / user123\n');
        
        console.log('🌐 Test endpoints:');
        console.log(`   GET  localhost:${PORT}/api/auth/users - List all users`);
        console.log(`   POST localhost:${PORT}/api/auth/register - Register new user`);
        console.log(`   POST localhost:${PORT}/api/auth/login - Login user`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down server...');
    if (pool) {
        await pool.end();
        console.log('✅ Database connection closed');
    }
    process.exit(0);
});

startServer().catch(console.error);
