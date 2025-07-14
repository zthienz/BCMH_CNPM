/**
 * Database Configuration and Connection
 * MySQL connection using mysql2 with connection pooling
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dulich_travinh',
    charset: 'utf8mb4',
    timezone: '+07:00', // Vietnam timezone
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // Connection pool settings
    connectionLimit: 10,
    queueLimit: 0,
    // Additional options
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database test query successful');
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Execute query with error handling
 */
async function executeQuery(sql, params = []) {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return { success: true, data: rows, fields };
    } catch (error) {
        console.error('Database query error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get single record
 */
async function getRecord(sql, params = []) {
    const result = await executeQuery(sql, params);
    if (result.success && result.data.length > 0) {
        return result.data[0];
    }
    return null;
}

/**
 * Get multiple records
 */
async function getRecords(sql, params = []) {
    const result = await executeQuery(sql, params);
    if (result.success) {
        return result.data;
    }
    return [];
}

/**
 * Insert record and return insert ID
 */
async function insertRecord(sql, params = []) {
    const result = await executeQuery(sql, params);
    if (result.success) {
        return result.data.insertId;
    }
    return null;
}

/**
 * Update/Delete record and return affected rows
 */
async function updateRecord(sql, params = []) {
    const result = await executeQuery(sql, params);
    if (result.success) {
        return result.data.affectedRows;
    }
    return 0;
}

/**
 * Check if table exists
 */
async function tableExists(tableName) {
    try {
        const sql = 'SHOW TABLES LIKE ?';
        const result = await executeQuery(sql, [tableName]);
        return result.success && result.data.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Validate database schema
 */
async function validateSchema() {
    const requiredTables = [
        'TaiKhoanNguoiDung',
        'diadiemdulich'
    ];
    
    const missingTables = [];
    
    for (const table of requiredTables) {
        const exists = await tableExists(table);
        if (!exists) {
            missingTables.push(table);
        }
    }
    
    if (missingTables.length > 0) {
        console.error('❌ Missing database tables:', missingTables.join(', '));
        return false;
    }
    
    console.log('✅ Database schema validation passed');
    return true;
}

/**
 * Create activity log table if not exists
 */
async function createActivityLogTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS HoatDongNguoiDung (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            MaTK VARCHAR(10) NOT NULL,
            HanhDong VARCHAR(50) NOT NULL,
            MoTa TEXT,
            DiaChiIP VARCHAR(45),
            UserAgent TEXT,
            ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_matk (MaTK),
            INDEX idx_hanhdong (HanhDong),
            INDEX idx_thoigian (ThoiGian),
            FOREIGN KEY (MaTK) REFERENCES TaiKhoanNguoiDung(MaTK) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
        await executeQuery(sql);
        console.log('✅ Activity log table ready');
        return true;
    } catch (error) {
        console.error('❌ Failed to create activity log table:', error.message);
        return false;
    }
}

/**
 * Initialize database
 */
async function initializeDatabase() {
    console.log('🔄 Initializing database...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
        throw new Error('Failed to connect to database');
    }
    
    // Validate schema
    const schemaValid = await validateSchema();
    if (!schemaValid) {
        console.warn('⚠️ Database schema validation failed, but continuing...');
    }
    
    // Create activity log table
    await createActivityLogTable();
    
    console.log('✅ Database initialization completed');
}

/**
 * Close database connection
 */
async function closeConnection() {
    try {
        await pool.end();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
    }
}

// Export functions and pool
module.exports = {
    pool,
    testConnection,
    executeQuery,
    getRecord,
    getRecords,
    insertRecord,
    updateRecord,
    tableExists,
    validateSchema,
    initializeDatabase,
    closeConnection
};
