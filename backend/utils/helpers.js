/**
 * Helper Functions
 * Common utility functions for the application
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { executeQuery, getRecord } = require('../config/database');

/**
 * Generate unique account ID
 */
function generateAccountId() {
    // Generate format: TK + 6 digit number
    const prefix = 'TK';
    const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
    return prefix + number.toString();
}

/**
 * Check if account ID exists
 */
async function accountIdExists(accountId) {
    const sql = 'SELECT MaTK FROM TaiKhoanNguoiDung WHERE MaTK = ?';
    const user = await getRecord(sql, [accountId]);
    return user !== null;
}

/**
 * Generate unique account ID that doesn't exist
 */
async function generateUniqueAccountId() {
    let accountId;
    let exists = true;
    
    while (exists) {
        accountId = generateAccountId();
        exists = await accountIdExists(accountId);
    }
    
    return accountId;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
}

/**
 * Hash password
 */
async function hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Sanitize input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Generate random token
 */
function generateToken(length = 32) {
    return uuidv4().replace(/-/g, '').substring(0, length);
}

/**
 * Get client IP address
 */
function getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           'unknown';
}

/**
 * Log user activity
 */
async function logUserActivity(accountId, action, description = '', req = null) {
    try {
        const sql = `
            INSERT INTO HoatDongNguoiDung (MaTK, HanhDong, MoTa, DiaChiIP, UserAgent) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const ipAddress = req ? getClientIP(req) : 'system';
        const userAgent = req ? req.get('User-Agent') || 'unknown' : 'system';
        
        await executeQuery(sql, [
            accountId,
            action,
            description,
            ipAddress,
            userAgent
        ]);
        
        console.log(`📝 Activity logged: ${accountId} - ${action}`);
    } catch (error) {
        console.error('Failed to log user activity:', error.message);
    }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
    const sql = `
        SELECT MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung 
        FROM TaiKhoanNguoiDung 
        WHERE Email = ?
    `;
    return await getRecord(sql, [email]);
}

/**
 * Get user by account ID
 */
async function getUserById(accountId) {
    const sql = `
        SELECT MaTK, TenNguoiDung, Email, LoaiNguoiDung 
        FROM TaiKhoanNguoiDung 
        WHERE MaTK = ?
    `;
    return await getRecord(sql, [accountId]);
}

/**
 * Check if email exists
 */
async function emailExists(email) {
    const user = await getUserByEmail(email);
    return user !== null;
}

/**
 * Create new user account
 */
async function createUser(name, email, password, userType = 'Khach') {
    try {
        // Generate unique account ID
        const accountId = await generateUniqueAccountId();
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Insert user
        const sql = `
            INSERT INTO TaiKhoanNguoiDung (MaTK, TenNguoiDung, Email, MatKhau, LoaiNguoiDung) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(sql, [accountId, name, email, hashedPassword, userType]);
        
        if (result.success) {
            return accountId;
        }
        
        return null;
    } catch (error) {
        console.error('Error creating user:', error.message);
        return null;
    }
}

/**
 * Update user last login
 */
async function updateLastLogin(accountId) {
    try {
        // First, try to add the column if it doesn't exist
        const alterSql = `
            ALTER TABLE TaiKhoanNguoiDung 
            ADD COLUMN IF NOT EXISTS LanDangNhapCuoi DATETIME DEFAULT NULL
        `;
        await executeQuery(alterSql);
        
        // Update last login
        const updateSql = 'UPDATE TaiKhoanNguoiDung SET LanDangNhapCuoi = NOW() WHERE MaTK = ?';
        await executeQuery(updateSql, [accountId]);
        
    } catch (error) {
        // Column might already exist or other error, continue silently
        console.log('Note: Could not update last login timestamp');
    }
}

/**
 * Send JSON response
 */
function sendResponse(res, statusCode, success, message, data = null) {
    const response = {
        success,
        message
    };
    
    if (data !== null) {
        if (success) {
            response.data = data;
        } else {
            response.error = data;
        }
    }
    
    res.status(statusCode).json(response);
}

/**
 * Send success response
 */
function sendSuccess(res, message, data = null) {
    sendResponse(res, 200, true, message, data);
}

/**
 * Send error response
 */
function sendError(res, message, statusCode = 400, errorData = null) {
    sendResponse(res, statusCode, false, message, errorData);
}

/**
 * Validate required fields
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            missingFields.push(field);
        }
    }
    
    return missingFields;
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxAttempts = 5, windowMs = 300000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create attempts array for this identifier
    let attempts = rateLimitStore.get(identifier) || [];
    
    // Remove old attempts outside the window
    attempts = attempts.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (attempts.length >= maxAttempts) {
        return false;
    }
    
    // Add current attempt
    attempts.push(now);
    rateLimitStore.set(identifier, attempts);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
        cleanupRateLimitStore(windowStart);
    }
    
    return true;
}

/**
 * Cleanup old rate limit entries
 */
function cleanupRateLimitStore(cutoffTime) {
    for (const [identifier, attempts] of rateLimitStore.entries()) {
        const validAttempts = attempts.filter(timestamp => timestamp > cutoffTime);
        if (validAttempts.length === 0) {
            rateLimitStore.delete(identifier);
        } else {
            rateLimitStore.set(identifier, validAttempts);
        }
    }
}

module.exports = {
    generateAccountId,
    accountIdExists,
    generateUniqueAccountId,
    isValidEmail,
    isValidPassword,
    hashPassword,
    verifyPassword,
    sanitizeInput,
    generateToken,
    getClientIP,
    logUserActivity,
    getUserByEmail,
    getUserById,
    emailExists,
    createUser,
    updateLastLogin,
    sendResponse,
    sendSuccess,
    sendError,
    validateRequiredFields,
    checkRateLimit
};
