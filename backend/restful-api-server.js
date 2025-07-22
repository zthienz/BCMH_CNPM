/**
 * RESTful API Server for Du Lich Tra Vinh
 * Complete CRUD operations for all resources
 */

require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dulichtravinh',
    charset: 'utf8mb4'
};

let pool;

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Only log in development mode
    if (NODE_ENV === 'development') {
        console.log(`📡 ${req.method} ${req.url} from origin: ${origin || 'null'}`);
    }

    // Get allowed origins from environment
    const corsOrigins = process.env.CORS_ORIGIN || 'http://localhost:5507,http://127.0.0.1:5507';
    const allowedOrigins = corsOrigins.split(',').map(o => o.trim());

    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
        // For requests without origin (like Postman)
        res.header('Access-Control-Allow-Origin', 'http://localhost:5507');
        res.header('Access-Control-Allow-Credentials', 'true');
    } else {
        // For disallowed origins, don't set credentials
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        if (NODE_ENV === 'development') {
            console.log('✅ Preflight request handled');
        }
        return res.sendStatus(200);
    }
    
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Database initialization
async function initDB() {
    try {
        console.log('🔄 Connecting to database...');
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
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

// Utility functions
const generateId = async (table, prefix) => {
    const [result] = await pool.execute(
        `SELECT MAX(CAST(SUBSTRING(${table === 'TaiKhoanNguoiDung' ? 'MaTK' : 'MaDiaDiem'}, ${prefix.length + 1}) AS UNSIGNED)) as maxId 
         FROM ${table} 
         WHERE ${table === 'TaiKhoanNguoiDung' ? 'MaTK' : 'MaDiaDiem'} LIKE "${prefix}%"`
    );
    const maxId = result[0].maxId || 0;
    return `${prefix}${(maxId + 1).toString().padStart(3, '0')}`;
};

// Input validation helper
const validateInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const handleError = (res, error, message = 'Internal server error') => {
    if (NODE_ENV === 'development') {
        console.error('❌ Error:', error);
    }

    // Don't expose internal error details in production
    res.status(500).json({
        success: false,
        message,
        ...(NODE_ENV === 'development' && { error: error.message })
    });
};

// ================================
// HEALTH CHECK & INFO ENDPOINTS
// ================================

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        port: PORT,
        database: pool ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/*',
            users: '/api/users/*',
            locations: '/api/locations/*',
            uploads: '/api/uploads/*'
        }
    });
});

app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Du Lich Tra Vinh API',
            version: '1.0.0',
            description: 'RESTful API for Tra Vinh Tourism Management System',
            endpoints: {
                'GET /health': 'Health check',
                'GET /api/info': 'API information',
                
                // Authentication
                'POST /api/auth/register': 'User registration',
                'POST /api/auth/login': 'User login',
                'POST /api/auth/logout': 'User logout',
                'GET /api/auth/session': 'Get current session',
                'POST /api/auth/refresh': 'Refresh token',
                
                // Users Management
                'GET /api/users': 'Get all users (Admin only)',
                'GET /api/users/:id': 'Get user by ID',
                'PUT /api/users/:id': 'Update user',
                'DELETE /api/users/:id': 'Delete user (Admin only)',
                'GET /api/users/profile': 'Get current user profile',
                'PUT /api/users/profile': 'Update current user profile',
                'PUT /api/users/password': 'Change password',
                
                // Locations Management
                'GET /api/locations': 'Get all locations',
                'GET /api/locations/:id': 'Get location by ID',
                'POST /api/locations': 'Create location (Admin only)',
                'PUT /api/locations/:id': 'Update location (Admin only)',
                'DELETE /api/locations/:id': 'Delete location (Admin only)',
                'GET /api/locations/search': 'Search locations',
                'GET /api/locations/category/:category': 'Get locations by category',
                'POST /api/locations/:id/rating': 'Rate location',
                'GET /api/locations/:id/ratings': 'Get location ratings',
                
                // File Upload
                'POST /api/uploads/image': 'Upload image',
                'DELETE /api/uploads/:filename': 'Delete uploaded file'
            }
        }
    });
});

// Start server
async function startServer() {
    const dbConnected = await initDB();
    
    app.listen(PORT, () => {
        console.log('🚀 RESTful API Server Started!');
        console.log(`📍 Server: http://localhost:${PORT}`);
        console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
        console.log(`🌐 CORS: Enabled for all origins`);
        console.log(`🔐 JWT: Enabled`);
        console.log(`📁 File Upload: Enabled`);
        console.log('');
        console.log('📋 Available Endpoints:');
        console.log('   GET  /health - Health check');
        console.log('   GET  /api/info - API information');
        console.log('   POST /api/auth/* - Authentication');
        console.log('   GET|POST|PUT|DELETE /api/users/* - User management');
        console.log('   GET|POST|PUT|DELETE /api/locations/* - Location management');
        console.log('   POST /api/uploads/* - File upload');
        console.log('');
        console.log('✅ RESTful API Ready!');
    });
}

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

// POST /api/auth/register - User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required'
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
                message: 'Email already exists'
            });
        }

        // Generate user ID
        const maTK = await generateId('TaiKhoanNguoiDung', 'TK');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user
        await pool.execute(
            'INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) VALUES (?, ?, ?, ?, ?)',
            [maTK, username, email, hashedPassword, 'Khach']
        );

        if (NODE_ENV === 'development') {
            console.log('✅ User registered:', email);
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
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
        handleError(res, error, 'Registration failed');
    }
});

// POST /api/auth/login - User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Get user from database
        const [users] = await pool.execute(
            'SELECT * FROM TaiKhoanNguoiDung WHERE Email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.MatKhau);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.MaTK,
                email: user.Email,
                name: user.TenNguoiDung,
                type: user.LoaiNguoiDung
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await pool.execute(
            'UPDATE TaiKhoanNguoiDung SET LanDangNhapCuoi = NOW() WHERE MaTK = ?',
            [user.MaTK]
        );

        if (NODE_ENV === 'development') {
            console.log('✅ User logged in:', email);
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.MaTK,
                    name: user.TenNguoiDung,
                    email: user.Email,
                    type: user.LoaiNguoiDung
                },
                token: token,
                expiresIn: '24h'
            }
        });

    } catch (error) {
        handleError(res, error, 'Login failed');
    }
});

// POST /api/auth/logout - User Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    console.log('✅ User logged out:', req.user.email);
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// GET /api/auth/session - Get Current Session
app.get('/api/auth/session', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            logged_in: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                type: req.user.type
            }
        }
    });
});

// POST /api/auth/refresh - Refresh Token
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
    const newToken = jwt.sign(
        {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            type: req.user.type
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        success: true,
        message: 'Token refreshed',
        data: {
            token: newToken,
            expiresIn: '24h'
        }
    });
});

// ================================
// USER MANAGEMENT ENDPOINTS
// ================================

// GET /api/users - Get All Users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung, NgayTao, LanDangNhapCuoi, TrangThai FROM TaiKhoanNguoiDung';
        let countQuery = 'SELECT COUNT(*) as total FROM TaiKhoanNguoiDung';
        let params = [];

        if (search) {
            query += ' WHERE TenNguoiDung LIKE ? OR Email LIKE ?';
            countQuery += ' WHERE TenNguoiDung LIKE ? OR Email LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        query += ' ORDER BY NgayTao DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await pool.execute(query, params);
        const [countResult] = await pool.execute(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

        res.json({
            success: true,
            data: {
                users: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        handleError(res, error, 'Failed to get users');
    }
});

// GET /api/users/:id - Get User by ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Users can only view their own profile unless they're admin
        if (req.user.type !== 'Admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const [users] = await pool.execute(
            'SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung, NgayTao, LanDangNhapCuoi, TrangThai FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user: users[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to get user');
    }
});

// PUT /api/users/:id - Update User
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, type, status } = req.body;

        // Users can only update their own profile unless they're admin
        if (req.user.type !== 'Admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only admin can change user type and status
        if (req.user.type !== 'Admin' && (type || status)) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can change user type or status'
            });
        }

        const updates = [];
        const params = [];

        if (name) {
            updates.push('TenNguoiDung = ?');
            params.push(name);
        }

        if (email) {
            // Check if email already exists for other users
            const [existing] = await pool.execute(
                'SELECT MaTK FROM TaiKhoanNguoiDung WHERE Email = ? AND MaTK != ?',
                [email, id]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            updates.push('Email = ?');
            params.push(email);
        }

        if (type && req.user.type === 'Admin') {
            updates.push('LoaiNguoiDung = ?');
            params.push(type);
        }

        if (status && req.user.type === 'Admin') {
            updates.push('TrangThai = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        params.push(id);

        await pool.execute(
            `UPDATE TaiKhoanNguoiDung SET ${updates.join(', ')} WHERE MaTK = ?`,
            params
        );

        // Get updated user
        const [users] = await pool.execute(
            'SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung, TrangThai FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [id]
        );

        console.log('✅ User updated:', id);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: users[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to update user');
    }
});

// DELETE /api/users/:id - Delete User (Admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const [users] = await pool.execute(
            'SELECT MaTK FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await pool.execute('DELETE FROM TaiKhoanNguoiDung WHERE MaTK = ?', [id]);

        console.log('✅ User deleted:', id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        handleError(res, error, 'Failed to delete user');
    }
});

// GET /api/users/profile - Get Current User Profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung, NgayTao, LanDangNhapCuoi FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user: users[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to get profile');
    }
});

// PUT /api/users/profile - Update Current User Profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        const updates = [];
        const params = [];

        if (name) {
            updates.push('TenNguoiDung = ?');
            params.push(name);
        }

        if (email) {
            // Check if email already exists for other users
            const [existing] = await pool.execute(
                'SELECT MaTK FROM TaiKhoanNguoiDung WHERE Email = ? AND MaTK != ?',
                [email, req.user.id]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            updates.push('Email = ?');
            params.push(email);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        params.push(req.user.id);

        await pool.execute(
            `UPDATE TaiKhoanNguoiDung SET ${updates.join(', ')} WHERE MaTK = ?`,
            params
        );

        // Get updated user
        const [users] = await pool.execute(
            'SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [req.user.id]
        );

        console.log('✅ Profile updated:', req.user.email);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: users[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to update profile');
    }
});

// PUT /api/users/password - Change Password
app.put('/api/users/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get current user with password
        const [users] = await pool.execute(
            'SELECT MatKhau FROM TaiKhoanNguoiDung WHERE MaTK = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, users[0].MatKhau);
        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await pool.execute(
            'UPDATE TaiKhoanNguoiDung SET MatKhau = ? WHERE MaTK = ?',
            [hashedNewPassword, req.user.id]
        );

        console.log('✅ Password changed:', req.user.email);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        handleError(res, error, 'Failed to change password');
    }
});

// ================================
// CATEGORY MANAGEMENT ENDPOINTS
// ================================

// GET /api/loaihinhdulich - Get All Categories
app.get('/api/loaihinhdulich', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM loaihinhdulich ORDER BY MALHDL'
        );

        res.json(categories);

    } catch (error) {
        handleError(res, error, 'Failed to get categories');
    }
});

// ================================
// LOCATION MANAGEMENT ENDPOINTS
// ================================

// GET /api/locations - Get All Locations
app.get('/api/locations', async (req, res) => {
    try {
        const { search = '', category = '' } = req.query;

        let query = 'SELECT * FROM diadiemdulich';
        let params = [];

        if (search && category) {
            query += ' WHERE (TenDDDL LIKE ? OR MoTa LIKE ? OR DiaChi LIKE ?) AND MALHDL = ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`, category];
        } else if (search) {
            query += ' WHERE (TenDDDL LIKE ? OR MoTa LIKE ? OR DiaChi LIKE ?)';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        } else if (category) {
            query += ' WHERE MALHDL = ?';
            params = [category];
        }

        query += ' ORDER BY MADDDL';

        const [locations] = await pool.execute(query, params);

        res.json(locations);

    } catch (error) {
        handleError(res, error, 'Failed to get locations');
    }
});

// GET /api/locations/:id - Get Location by ID
app.get('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [locations] = await pool.execute(
            'SELECT * FROM diadiemdulich WHERE MADDDL = ?',
            [id]
        );

        if (locations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Increment view count
        await pool.execute(
            'UPDATE diadiemdulich SET LuotXem = LuotXem + 1 WHERE MaDiaDiem = ?',
            [id]
        );

        res.json({
            success: true,
            data: { location: locations[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to get location');
    }
});

// POST /api/locations - Create Location (Admin only)
app.post('/api/locations', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const {
            name, description, address, coordinates, category,
            price = 0, openingHours, rating = 0
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name and category are required'
            });
        }

        // Generate location ID
        const maDiaDiem = await generateId('diadiemdulich', 'DD');

        // Handle uploaded image
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        await pool.execute(
            `INSERT INTO diadiemdulich
             (MaDiaDiem, TenDiaDiem, MoTa, DiaChi, ToaDo, LoaiDiaDiem, GiaVe, ThoiGianMoCua, HinhAnh, DanhGia)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [maDiaDiem, name, description, address, coordinates, category, price, openingHours, imagePath, rating]
        );

        // Get created location
        const [locations] = await pool.execute(
            'SELECT * FROM diadiemdulich WHERE MaDiaDiem = ?',
            [maDiaDiem]
        );

        console.log('✅ Location created:', name);

        res.status(201).json({
            success: true,
            message: 'Location created successfully',
            data: { location: locations[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to create location');
    }
});

// PUT /api/locations/:id - Update Location (Admin only)
app.put('/api/locations/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, description, address, coordinates, category,
            price, openingHours, rating, status
        } = req.body;

        // Check if location exists
        const [existing] = await pool.execute(
            'SELECT * FROM diadiemdulich WHERE MaDiaDiem = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const updates = [];
        const params = [];

        if (name) {
            updates.push('TenDiaDiem = ?');
            params.push(name);
        }

        if (description !== undefined) {
            updates.push('MoTa = ?');
            params.push(description);
        }

        if (address) {
            updates.push('DiaChi = ?');
            params.push(address);
        }

        if (coordinates) {
            updates.push('ToaDo = ?');
            params.push(coordinates);
        }

        if (category) {
            updates.push('LoaiDiaDiem = ?');
            params.push(category);
        }

        if (price !== undefined) {
            updates.push('GiaVe = ?');
            params.push(price);
        }

        if (openingHours) {
            updates.push('ThoiGianMoCua = ?');
            params.push(openingHours);
        }

        if (rating !== undefined) {
            updates.push('DanhGia = ?');
            params.push(rating);
        }



        // Handle uploaded image
        if (req.file) {
            updates.push('HinhAnh = ?');
            params.push(`/uploads/${req.file.filename}`);

            // Delete old image if exists
            if (existing[0].HinhAnh) {
                const oldImagePath = path.join(__dirname, existing[0].HinhAnh);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        params.push(id);

        await pool.execute(
            `UPDATE diadiemdulich SET ${updates.join(', ')} WHERE MaDiaDiem = ?`,
            params
        );

        // Get updated location
        const [locations] = await pool.execute(
            'SELECT * FROM diadiemdulich WHERE MaDiaDiem = ?',
            [id]
        );

        console.log('✅ Location updated:', id);

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: { location: locations[0] }
        });

    } catch (error) {
        handleError(res, error, 'Failed to update location');
    }
});

// DELETE /api/locations/:id - Delete Location (Admin only)
app.delete('/api/locations/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if location exists
        const [locations] = await pool.execute(
            'SELECT HinhAnh FROM diadiemdulich WHERE MaDiaDiem = ?',
            [id]
        );

        if (locations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Delete image file if exists
        if (locations[0].HinhAnh) {
            const imagePath = path.join(__dirname, locations[0].HinhAnh);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await pool.execute('DELETE FROM diadiemdulich WHERE MaDiaDiem = ?', [id]);

        console.log('✅ Location deleted:', id);

        res.json({
            success: true,
            message: 'Location deleted successfully'
        });

    } catch (error) {
        handleError(res, error, 'Failed to delete location');
    }
});

// GET /api/locations/search - Search Locations
app.get('/api/locations/search', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, minRating } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        let query = `SELECT * FROM diadiemdulich WHERE 1=1
                     AND (TenDDDL LIKE ? OR MoTa LIKE ? OR DiaChi LIKE ?)`;
        let params = [`%${q}%`, `%${q}%`, `%${q}%`];

        if (category) {
            query += ' AND LoaiDiaDiem = ?';
            params.push(category);
        }

        if (minPrice) {
            query += ' AND GiaVe >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ' AND GiaVe <= ?';
            params.push(parseFloat(maxPrice));
        }

        if (minRating) {
            query += ' AND DanhGia >= ?';
            params.push(parseFloat(minRating));
        }

        query += ' ORDER BY DanhGia DESC, LuotXem DESC';

        const [locations] = await pool.execute(query, params);

        res.json({
            success: true,
            data: {
                locations: locations,
                count: locations.length,
                query: q
            }
        });

    } catch (error) {
        handleError(res, error, 'Search failed');
    }
});

// GET /api/locations/category/:category - Get Locations by Category
app.get('/api/locations/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [locations] = await pool.execute(
            'SELECT * FROM diadiemdulich WHERE MALHDL = ? ORDER BY MADDDL LIMIT ? OFFSET ?',
            [category, parseInt(limit), parseInt(offset)]
        );

        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM diadiemdulich WHERE MALHDL = ?',
            [category]
        );

        res.json({
            success: true,
            data: {
                locations: locations,
                category: category,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        handleError(res, error, 'Failed to get locations by category');
    }
});

// ================================
// FILE UPLOAD ENDPOINTS
// ================================

// POST /api/uploads/image - Upload Image
app.post('/api/uploads/image', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        console.log('✅ Image uploaded:', req.file.filename);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: `/uploads/${req.file.filename}`
            }
        });

    } catch (error) {
        handleError(res, error, 'Failed to upload image');
    }
});

// DELETE /api/uploads/:filename - Delete Uploaded File
app.delete('/api/uploads/:filename', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, 'uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        fs.unlinkSync(filePath);

        console.log('✅ File deleted:', filename);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        handleError(res, error, 'Failed to delete file');
    }
});

// ================================
// ERROR HANDLING
// ================================

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: '/api/info'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

startServer();
