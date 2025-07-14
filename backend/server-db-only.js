/**
 * Express Server with REAL Database Connection ONLY
 * No mock data - requires working MySQL database
 */

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dulich_travinh',
    charset: 'utf8mb4',
    timezone: '+07:00',
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
let pool;

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
        
        // Check if required table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'TaiKhoanNguoiDung'");
        if (tables.length === 0) {
            console.log('❌ Table TaiKhoanNguoiDung not found!');
            console.log('📝 Please run the SQL script to create tables:');
            console.log('   1. Open MySQL Workbench');
            console.log('   2. Run: backend/create-database.sql');
            process.exit(1);
        }
        
        console.log('✅ Table TaiKhoanNguoiDung found');
        
        // Check sample data
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM TaiKhoanNguoiDung');
        console.log(`📊 Found ${users[0].count} users in database`);
        
        connection.release();
        return true;
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n🔧 Please check:');
        console.log('   1. MySQL server is running');
        console.log('   2. Database credentials in .env file');
        console.log('   3. Database "dulich_travinh" exists');
        console.log('   4. User has proper permissions');
        process.exit(1);
    }
}

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:5500',
            'http://localhost:5500',
            'file://'
        ];
        
        if (allowedOrigins.includes(origin) || origin.startsWith('file://')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MySQL store
const sessionStore = new MySQLStore(dbConfig);

app.use(session({
    key: process.env.SESSION_NAME || 'travinh_session',
    secret: process.env.SESSION_SECRET || 'change-this-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    rolling: true
}));

// Helper functions
async function findUserByEmail(email) {
    try {
        const [rows] = await pool.execute(
            'SELECT MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung FROM TaiKhoanNguoiDung WHERE Email = ?',
            [email]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function createUser(name, email, password, userType = 'Khach') {
    try {
        // Generate unique account ID
        const accountId = await generateUniqueAccountId();
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Insert user
        await pool.execute(
            'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
            [accountId, name, email, hashedPassword, userType]
        );
        
        // Log activity
        await logUserActivity(accountId, 'register', 'User registered successfully');
        
        return accountId;
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Email đã được sử dụng');
        }
        throw new Error('Không thể tạo tài khoản');
    }
}

async function generateUniqueAccountId() {
    let accountId;
    let exists = true;
    
    while (exists) {
        accountId = generateAccountId();
        
        const [rows] = await pool.execute(
            'SELECT MaTK FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [accountId]
        );
        exists = rows.length > 0;
    }
    
    return accountId;
}

function generateAccountId() {
    const prefix = 'TK';
    const number = Math.floor(Math.random() * 900000) + 100000;
    return prefix + number.toString();
}

async function logUserActivity(accountId, action, description = '', req = null) {
    try {
        // Create activity table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS HoatDongNguoiDung (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                MaTK VARCHAR(10) NOT NULL,
                HanhDong VARCHAR(50) NOT NULL,
                MoTa TEXT DEFAULT NULL,
                DiaChiIP VARCHAR(45) DEFAULT NULL,
                UserAgent TEXT DEFAULT NULL,
                ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_matk (MaTK),
                FOREIGN KEY (MaTK) REFERENCES TaiKhoanNguoiDung(MaTK) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        const ipAddress = req ? (req.ip || req.connection.remoteAddress || 'unknown') : 'system';
        const userAgent = req ? (req.get('User-Agent') || 'unknown') : 'system';
        
        await pool.execute(
            'INSERT INTO HoatDongNguoiDung (MaTK, HanhDong, MoTa, DiaChiIP, UserAgent) VALUES (?, ?, ?, ?, ?)',
            [accountId, action, description, ipAddress, userAgent]
        );
    } catch (error) {
        console.error('Log activity error:', error);
    }
}

// Health check
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        const [result] = await pool.execute('SELECT COUNT(*) as userCount FROM TaiKhoanNguoiDung');
        
        res.json({
            success: true,
            message: 'Server is running with real database',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'MySQL Connected',
            userCount: result[0].userCount,
            mode: 'production'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection error',
            error: error.message
        });
    }
});

// Root endpoint
app.get('/', async (req, res) => {
    try {
        const [result] = await pool.execute('SELECT COUNT(*) as count FROM TaiKhoanNguoiDung');
        
        res.json({
            success: true,
            message: 'Tra Vinh Travel API Server - Real Database Mode',
            version: '1.0.0',
            database: 'MySQL',
            userCount: result[0].count,
            endpoints: {
                health: '/health',
                auth: '/api/auth'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu không được để trống'
            });
        }

        // Find user in database
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.MatKhau);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Create session
        req.session.userId = user.MaTK;
        req.session.userName = user.TenNguoiDung;
        req.session.userEmail = user.Email;
        req.session.userType = user.LoaiNguoiDung;
        req.session.loginTime = Math.floor(Date.now() / 1000);

        // Log activity
        await logUserActivity(user.MaTK, 'login', 'User logged in successfully', req);

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: user.MaTK,
                    name: user.TenNguoiDung,
                    email: user.Email,
                    type: user.LoaiNguoiDung,
                    login_time: req.session.loginTime
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đăng nhập'
        });
    }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường đều bắt buộc'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Check if email exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email này đã được sử dụng'
            });
        }

        // Create new user
        const accountId = await createUser(name.trim(), email, password, 'Khach');

        res.json({
            success: true,
            message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
            data: {
                account_id: accountId
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi đăng ký'
        });
    }
});

// Session check endpoint
app.get('/api/auth/session', (req, res) => {
    try {
        if (req.session.userId) {
            res.json({
                success: true,
                message: 'Session active',
                data: {
                    logged_in: true,
                    user: {
                        id: req.session.userId,
                        name: req.session.userName,
                        email: req.session.userEmail,
                        type: req.session.userType,
                        login_time: req.session.loginTime
                    }
                }
            });
        } else {
            res.json({
                success: true,
                message: 'No active session',
                data: {
                    logged_in: false
                }
            });
        }
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi kiểm tra phiên đăng nhập'
        });
    }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
    try {
        if (req.session.userId) {
            // Log activity
            await logUserActivity(req.session.userId, 'logout', 'User logged out', req);
            
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Có lỗi xảy ra khi đăng xuất'
                    });
                }

                res.json({
                    success: true,
                    message: 'Đăng xuất thành công'
                });
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Không có phiên đăng nhập nào'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đăng xuất'
        });
    }
});

// Get all users (for testing)
app.get('/api/auth/users', async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung ORDER BY MaTK'
        );
        
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: users,
                count: users.length
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách người dùng'
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
async function startServer() {
    try {
        // Initialize database connection
        await initDatabase();
        
        // Start listening
        app.listen(PORT, () => {
            console.log('🚀 Server started successfully!');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`💾 Database: MySQL Connected (Real Data)`);
            console.log('✅ Ready to accept connections');
            console.log('');
            console.log('📝 Sample accounts (from database):');
            console.log('   Admin: admin@travinh-travel.com / admin123');
            console.log('   User:  user@example.com / user123');
            console.log('');
            console.log('🌐 Test endpoints:');
            console.log(`   GET  ${PORT}/api/auth/users - List all users`);
            console.log(`   POST ${PORT}/api/auth/register - Register new user`);
            console.log(`   POST ${PORT}/api/auth/login - Login user`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
