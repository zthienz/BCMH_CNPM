/**
 * Simple CORS-enabled Server for Testing
 */

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Database config
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Thien@160504',
    database: 'dulichtravinh',
    charset: 'utf8mb4'
};

let pool;

// CORS middleware - Fixed for credentials
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // For requests with credentials, we cannot use wildcard
    // Must specify exact origin or use 'null' for file:// protocol
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // For file:// protocol (origin is null)
        res.header('Access-Control-Allow-Origin', 'null');
    }

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
async function initDB() {
    try {
        console.log('🔄 Connecting to database...');
        pool = mysql.createPool(dbConfig);
        
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        
        console.log('✅ Database connected');
        return true;
    } catch (error) {
        console.error('❌ Database error:', error.message);
        return false;
    }
}

// Health check
app.get('/health', (req, res) => {
    console.log('Health check from:', req.headers.origin || 'unknown');
    res.json({
        status: 'OK',
        port: PORT,
        database: pool ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        cors: 'Enabled'
    });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    console.log('🔐 Login request from:', req.headers.origin || 'unknown');
    console.log('📝 Login data:', req.body);
    
    try {
        const { email, password } = req.body;
        
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
        
        // Check password
        const passwordMatch = await bcrypt.compare(password, user.MatKhau);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        console.log('✅ Login successful:', email);

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
    console.log('📝 Register request from:', req.headers.origin || 'unknown');
    
    try {
        const { username, email, password } = req.body;
        
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

        // Generate MaTK
        const [result] = await pool.execute('SELECT MAX(CAST(SUBSTRING(MaTK, 3) AS UNSIGNED)) as maxId FROM TaiKhoanNguoiDung WHERE MaTK LIKE "TK%"');
        const maxId = result[0].maxId || 0;
        const maTK = `TK${(maxId + 1).toString().padStart(2, '0')}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user
        await pool.execute(
            'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
            [maTK, username, email, hashedPassword, 'Khach']
        );

        console.log('✅ Registration successful:', email);

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

// Session endpoint
app.get('/api/auth/session', (req, res) => {
    console.log('🔍 Session check from:', req.headers.origin || 'unknown');
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
    console.log('🚪 Logout request from:', req.headers.origin || 'unknown');
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

// Users list (for testing)
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
    const dbConnected = await initDB();
    
    if (!dbConnected) {
        console.log('⚠️ Starting without database connection');
    }
    
    app.listen(PORT, () => {
        console.log('🚀 Simple CORS Server started!');
        console.log(`📍 Server: http://localhost:${PORT}`);
        console.log(`🔗 Health: http://localhost:${PORT}/health`);
        console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
        console.log(`🌐 CORS: Enabled for all origins`);
        console.log('');
        console.log('📝 Test credentials:');
        console.log('   Email: vpt123@gmail.com');
        console.log('   Password: 123456');
        console.log('');
        console.log('✅ Ready for testing!');
    });
}

startServer();
