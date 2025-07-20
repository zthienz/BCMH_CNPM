/**
 * Simple Server Starter - Debug Version
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'file://', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Initialize database
async function initDB() {
    try {
        console.log('🔄 Connecting to database...');
        pool = mysql.createPool(dbConfig);
        
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
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
        
        // Simple password check (in production, use bcrypt)
        if (password !== user.MatKhau) {
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

        // Insert new user
        const [result] = await pool.execute(
            'INSERT INTO TaiKhoanNguoiDung (TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?)',
            [username, email, password, 'user']
        );

        console.log('✅ Registration successful for:', email);

        res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: {
                    id: result.insertId,
                    name: username,
                    email: email,
                    type: 'user'
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

// Start server
async function startServer() {
    const dbConnected = await initDB();
    
    if (!dbConnected) {
        console.log('⚠️  Starting server without database connection');
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    });
}

startServer().catch(console.error);
