/**
 * Authentication Routes
 * Handles user login, registration, and session management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const {
    getUserByEmail,
    getUserById,
    emailExists,
    createUser,
    updateLastLogin,
    verifyPassword,
    logUserActivity,
    sendSuccess,
    sendError,
    validateRequiredFields,
    checkRateLimit,
    getClientIP,
    sanitizeInput,
    isValidEmail,
    isValidPassword
} = require('../utils/helpers');

/**
 * POST /api/auth/login
 * User login endpoint
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Dữ liệu không hợp lệ', 400, errors.array());
        }

        const { email, password } = req.body;

        // Rate limiting
        const clientIP = getClientIP(req);
        if (!checkRateLimit(`login_${clientIP}`, 5, 300000)) {
            return sendError(res, 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 5 phút.', 429);
        }

        // Get user from database
        const user = await getUserByEmail(email);
        if (!user) {
            return sendError(res, 'Email hoặc mật khẩu không đúng', 401);
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.MatKhau);
        if (!isValidPassword) {
            return sendError(res, 'Email hoặc mật khẩu không đúng', 401);
        }

        // Create session
        req.session.userId = user.MaTK;
        req.session.userName = user.TenNguoiDung;
        req.session.userEmail = user.Email;
        req.session.userType = user.LoaiNguoiDung;
        req.session.loginTime = Math.floor(Date.now() / 1000);

        // Update last login
        await updateLastLogin(user.MaTK);

        // Log activity
        await logUserActivity(user.MaTK, 'login', 'User logged in successfully', req);

        // Send response
        sendSuccess(res, 'Đăng nhập thành công', {
            user: {
                id: user.MaTK,
                name: user.TenNguoiDung,
                email: user.Email,
                type: user.LoaiNguoiDung,
                login_time: req.session.loginTime
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 'Có lỗi xảy ra khi đăng nhập', 500);
    }
});

/**
 * POST /api/auth/register
 * User registration endpoint
 */
router.post('/register', [
    body('name').isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Dữ liệu không hợp lệ', 400, errors.array());
        }

        const { name, email, password } = req.body;

        // Rate limiting
        const clientIP = getClientIP(req);
        if (!checkRateLimit(`register_${clientIP}`, 3, 300000)) {
            return sendError(res, 'Quá nhiều lần thử đăng ký. Vui lòng thử lại sau 5 phút.', 429);
        }

        // Sanitize input
        const sanitizedName = sanitizeInput(name);

        // Additional validation
        if (!isValidEmail(email)) {
            return sendError(res, 'Email không hợp lệ', 400);
        }

        if (!isValidPassword(password)) {
            return sendError(res, 'Mật khẩu phải có ít nhất 6 ký tự', 400);
        }

        if (sanitizedName.length < 2) {
            return sendError(res, 'Họ và tên phải có ít nhất 2 ký tự', 400);
        }

        // Check if email already exists
        const exists = await emailExists(email);
        if (exists) {
            return sendError(res, 'Email này đã được sử dụng', 409);
        }

        // Create new user
        const accountId = await createUser(sanitizedName, email, password, 'Khach');
        if (!accountId) {
            return sendError(res, 'Có lỗi xảy ra khi tạo tài khoản', 500);
        }

        // Log activity
        await logUserActivity(accountId, 'register', 'User registered successfully', req);

        // Send response
        sendSuccess(res, 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', {
            account_id: accountId
        });

    } catch (error) {
        console.error('Register error:', error);
        sendError(res, 'Có lỗi xảy ra khi đăng ký', 500);
    }
});

/**
 * POST /api/auth/logout
 * User logout endpoint
 */
router.post('/logout', async (req, res) => {
    try {
        if (req.session.userId) {
            // Log activity
            await logUserActivity(req.session.userId, 'logout', 'User logged out', req);

            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return sendError(res, 'Có lỗi xảy ra khi đăng xuất', 500);
                }

                // Clear session cookie
                res.clearCookie(process.env.SESSION_NAME || 'travinh_session');
                sendSuccess(res, 'Đăng xuất thành công');
            });
        } else {
            sendError(res, 'Không có phiên đăng nhập nào', 400);
        }
    } catch (error) {
        console.error('Logout error:', error);
        sendError(res, 'Có lỗi xảy ra khi đăng xuất', 500);
    }
});

/**
 * GET /api/auth/session
 * Check current session
 */
router.get('/session', async (req, res) => {
    try {
        if (req.session.userId) {
            // Verify user still exists
            const user = await getUserById(req.session.userId);
            if (!user) {
                // User no longer exists, destroy session
                req.session.destroy();
                return sendSuccess(res, 'No active session', { logged_in: false });
            }

            sendSuccess(res, 'Session active', {
                logged_in: true,
                user: {
                    id: req.session.userId,
                    name: req.session.userName,
                    email: req.session.userEmail,
                    type: req.session.userType,
                    login_time: req.session.loginTime
                }
            });
        } else {
            sendSuccess(res, 'No active session', { logged_in: false });
        }
    } catch (error) {
        console.error('Session check error:', error);
        sendError(res, 'Có lỗi xảy ra khi kiểm tra phiên đăng nhập', 500);
    }
});

/**
 * GET /api/auth/user
 * Get current user info
 */
router.get('/user', async (req, res) => {
    try {
        if (!req.session.userId) {
            return sendError(res, 'Chưa đăng nhập', 401);
        }

        const user = await getUserById(req.session.userId);
        if (!user) {
            // User no longer exists, destroy session
            req.session.destroy();
            return sendError(res, 'Không tìm thấy thông tin người dùng', 404);
        }

        sendSuccess(res, 'Thông tin người dùng', {
            user: {
                id: user.MaTK,
                name: user.TenNguoiDung,
                email: user.Email,
                type: user.LoaiNguoiDung
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        sendError(res, 'Có lỗi xảy ra khi lấy thông tin người dùng', 500);
    }
});

/**
 * POST /api/auth/check-email
 * Check if email exists (for registration form)
 */
router.post('/check-email', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Email không hợp lệ', 400);
        }

        const { email } = req.body;
        const exists = await emailExists(email);

        sendSuccess(res, 'Email check completed', {
            exists: exists,
            available: !exists
        });

    } catch (error) {
        console.error('Email check error:', error);
        sendError(res, 'Có lỗi xảy ra khi kiểm tra email', 500);
    }
});

module.exports = router;
