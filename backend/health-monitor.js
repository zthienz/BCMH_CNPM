/**
 * Health Monitor for Du Lich Tra Vinh API
 * Monitors server health and automatically restarts if needed
 */

const http = require('http');
const { spawn } = require('child_process');

const SERVER_URL = 'http://localhost:3001';
const CHECK_INTERVAL = 30000; // 30 seconds
const RESTART_DELAY = 5000; // 5 seconds
const MAX_RESTART_ATTEMPTS = 3;

let serverProcess = null;
let restartAttempts = 0;
let lastHealthCheck = Date.now();

console.log('🔍 Health Monitor Started');
console.log(`📍 Monitoring: ${SERVER_URL}`);
console.log(`⏱️  Check Interval: ${CHECK_INTERVAL / 1000}s`);
console.log('');

// Start the server
function startServer() {
    console.log('🚀 Starting server...');
    
    serverProcess = spawn('node', ['restful-api-server.js'], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    serverProcess.on('exit', (code, signal) => {
        console.log(`❌ Server exited with code ${code}, signal ${signal}`);
        
        if (restartAttempts < MAX_RESTART_ATTEMPTS) {
            restartAttempts++;
            console.log(`🔄 Restarting server (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
            setTimeout(startServer, RESTART_DELAY);
        } else {
            console.log('❌ Max restart attempts reached. Stopping monitor.');
            process.exit(1);
        }
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Server process error:', error);
    });
}

// Check server health
async function checkHealth() {
    return new Promise((resolve) => {
        const req = http.request(`${SERVER_URL}/health`, {
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.success === true);
                } catch (error) {
                    resolve(false);
                }
            });
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Monitor loop
async function monitor() {
    const isHealthy = await checkHealth();
    const now = Date.now();
    
    if (isHealthy) {
        console.log(`✅ Health check passed (${new Date().toLocaleTimeString()})`);
        restartAttempts = 0; // Reset restart attempts on successful check
        lastHealthCheck = now;
    } else {
        console.log(`❌ Health check failed (${new Date().toLocaleTimeString()})`);
        
        // If server is unresponsive for too long, restart it
        if (now - lastHealthCheck > CHECK_INTERVAL * 2) {
            console.log('🔄 Server appears to be stuck. Restarting...');
            
            if (serverProcess) {
                serverProcess.kill('SIGTERM');
                setTimeout(() => {
                    if (serverProcess && !serverProcess.killed) {
                        serverProcess.kill('SIGKILL');
                    }
                }, 5000);
            }
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📡 SIGINT received. Shutting down monitor...');
    
    if (serverProcess) {
        console.log('🔄 Stopping server...');
        serverProcess.kill('SIGTERM');
        
        setTimeout(() => {
            if (serverProcess && !serverProcess.killed) {
                console.log('❌ Force killing server...');
                serverProcess.kill('SIGKILL');
            }
            process.exit(0);
        }, 10000);
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    console.log('\n📡 SIGTERM received. Shutting down monitor...');
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
    }
    process.exit(0);
});

// Start monitoring
startServer();
setInterval(monitor, CHECK_INTERVAL);

console.log('🔍 Health monitoring active. Press Ctrl+C to stop.');
