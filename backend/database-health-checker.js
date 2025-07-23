/**
 * Database Health Checker & Auto-repair
 * Monitors database connection and fixes common issues automatically
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dulichtravinh',
    charset: 'utf8mb4'
};

class DatabaseHealthChecker {
    constructor() {
        this.connection = null;
        this.isHealthy = false;
        this.lastCheck = null;
        this.checkInterval = 30000; // 30 seconds
        this.repairAttempts = 0;
        this.maxRepairAttempts = 3;
    }

    async initialize() {
        console.log('🔍 Database Health Checker initialized');
        await this.performHealthCheck();
        
        // Start periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, this.checkInterval);
    }

    async performHealthCheck() {
        try {
            console.log(`🔍 Performing database health check... (${new Date().toLocaleTimeString()})`);
            
            // Test connection
            await this.testConnection();
            
            // Test critical tables
            await this.testTables();
            
            // Test data integrity
            await this.testDataIntegrity();
            
            this.isHealthy = true;
            this.lastCheck = new Date();
            this.repairAttempts = 0;
            
            console.log('✅ Database health check passed');
            
        } catch (error) {
            console.error('❌ Database health check failed:', error.message);
            this.isHealthy = false;
            
            // Attempt auto-repair
            await this.attemptRepair(error);
        }
    }

    async testConnection() {
        if (this.connection) {
            try {
                await this.connection.end();
            } catch (e) {
                // Ignore connection close errors
            }
        }
        
        this.connection = await mysql.createConnection(dbConfig);
        await this.connection.execute('SELECT 1');
    }

    async testTables() {
        const requiredTables = [
            'TaiKhoanNguoiDung',
            'diadiemdulich', 
            'loaihinhdulich'
        ];

        for (const table of requiredTables) {
            const [rows] = await this.connection.execute(
                `SELECT COUNT(*) as count FROM ${table} LIMIT 1`
            );
            
            if (rows[0].count === undefined) {
                throw new Error(`Table ${table} is not accessible`);
            }
        }
    }

    async testDataIntegrity() {
        // Test if we have basic data
        const [users] = await this.connection.execute(
            'SELECT COUNT(*) as count FROM TaiKhoanNguoiDung'
        );
        
        const [locations] = await this.connection.execute(
            'SELECT COUNT(*) as count FROM diadiemdulich'
        );
        
        const [categories] = await this.connection.execute(
            'SELECT COUNT(*) as count FROM loaihinhdulich'
        );

        if (locations[0].count === 0) {
            console.log('⚠️ No locations found, may need data restoration');
        }
        
        if (categories[0].count === 0) {
            console.log('⚠️ No categories found, may need data restoration');
        }
    }

    async attemptRepair(error) {
        if (this.repairAttempts >= this.maxRepairAttempts) {
            console.error('❌ Max repair attempts reached. Manual intervention required.');
            return;
        }

        this.repairAttempts++;
        console.log(`🔧 Attempting database repair (attempt ${this.repairAttempts}/${this.maxRepairAttempts})`);

        try {
            // Common repair strategies
            if (error.message.includes('Connection lost')) {
                await this.repairConnection();
            } else if (error.message.includes('Table') && error.message.includes('exist')) {
                await this.repairTables();
            } else if (error.message.includes('Access denied')) {
                await this.repairPermissions();
            } else {
                await this.genericRepair();
            }

            console.log('✅ Database repair completed');
            
        } catch (repairError) {
            console.error('❌ Database repair failed:', repairError.message);
        }
    }

    async repairConnection() {
        console.log('🔧 Repairing database connection...');
        
        // Wait a bit before reconnecting
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try to reconnect
        await this.testConnection();
    }

    async repairTables() {
        console.log('🔧 Checking and repairing tables...');
        
        // Run setup script if tables are missing
        const setupScript = path.join(__dirname, 'setup-complete-database.js');
        if (fs.existsSync(setupScript)) {
            console.log('🔧 Running database setup script...');
            const { spawn } = require('child_process');
            
            return new Promise((resolve, reject) => {
                const setup = spawn('node', [setupScript], { stdio: 'inherit' });
                setup.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Setup script failed with code ${code}`));
                    }
                });
            });
        }
    }

    async repairPermissions() {
        console.log('🔧 Database permission issue detected');
        console.log('⚠️ Please check database user permissions manually');
    }

    async genericRepair() {
        console.log('🔧 Performing generic database repair...');
        
        // Try to reconnect and test basic functionality
        await this.repairConnection();
        await this.testTables();
    }

    getHealthStatus() {
        return {
            healthy: this.isHealthy,
            lastCheck: this.lastCheck,
            repairAttempts: this.repairAttempts
        };
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
        }
    }
}

// Export for use in main server
module.exports = DatabaseHealthChecker;

// Run standalone if called directly
if (require.main === module) {
    const checker = new DatabaseHealthChecker();
    checker.initialize().catch(console.error);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🔄 Shutting down database health checker...');
        await checker.close();
        process.exit(0);
    });
}
