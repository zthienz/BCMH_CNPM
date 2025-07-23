/**
 * Windows Service Wrapper for Du Lich Tra Vinh API
 * This creates a robust service that auto-restarts and survives system reboots
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

class ServiceWrapper {
    constructor() {
        this.serverProcess = null;
        this.isRunning = false;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.checkInterval = 30000; // 30 seconds
        this.logFile = path.join(__dirname, 'service.log');
        
        // Bind methods
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.restart = this.restart.bind(this);
        this.checkHealth = this.checkHealth.bind(this);
        this.log = this.log.bind(this);
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        console.log(message);
        
        try {
            fs.appendFileSync(this.logFile, logMessage);
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    async start() {
        if (this.isRunning) {
            this.log('⚠️ Service already running');
            return;
        }

        this.log('🚀 Starting Du Lich Tra Vinh API Service...');
        
        try {
            // Kill any existing processes
            await this.killExistingProcesses();
            
            // Start the server
            this.serverProcess = spawn('node', ['restful-api-server.js'], {
                cwd: __dirname,
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            this.serverProcess.stdout.on('data', (data) => {
                this.log(`SERVER: ${data.toString().trim()}`);
            });

            this.serverProcess.stderr.on('data', (data) => {
                this.log(`SERVER ERROR: ${data.toString().trim()}`);
            });

            this.serverProcess.on('exit', (code, signal) => {
                this.log(`❌ Server exited with code ${code}, signal ${signal}`);
                this.isRunning = false;
                
                if (this.restartCount < this.maxRestarts) {
                    this.restartCount++;
                    this.log(`🔄 Auto-restarting (${this.restartCount}/${this.maxRestarts})...`);
                    setTimeout(() => this.start(), 5000);
                } else {
                    this.log('❌ Max restart attempts reached');
                }
            });

            this.serverProcess.on('error', (error) => {
                this.log(`❌ Server process error: ${error.message}`);
                this.isRunning = false;
            });

            this.isRunning = true;
            this.log('✅ Server process started');
            
            // Wait for server to be ready
            await this.waitForServer();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
        } catch (error) {
            this.log(`❌ Failed to start server: ${error.message}`);
            throw error;
        }
    }

    async killExistingProcesses() {
        return new Promise((resolve) => {
            const { exec } = require('child_process');
            
            // Kill Node.js processes
            exec('taskkill /f /im node.exe', () => {
                // Kill by port
                exec('netstat -ano | findstr :3001', (error, stdout) => {
                    if (stdout) {
                        const lines = stdout.split('\n');
                        lines.forEach(line => {
                            const match = line.match(/\s+(\d+)$/);
                            if (match) {
                                const pid = match[1];
                                exec(`taskkill /PID ${pid} /F`, () => {});
                            }
                        });
                    }
                    setTimeout(resolve, 3000);
                });
            });
        });
    }

    async waitForServer() {
        const maxWait = 30000; // 30 seconds
        const interval = 1000; // 1 second
        let waited = 0;

        while (waited < maxWait) {
            try {
                const isHealthy = await this.checkHealth();
                if (isHealthy) {
                    this.log('✅ Server is ready and healthy');
                    return;
                }
            } catch (error) {
                // Continue waiting
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
            waited += interval;
        }
        
        throw new Error('Server failed to start within timeout');
    }

    async checkHealth() {
        return new Promise((resolve) => {
            const req = http.request('http://localhost:3001/health', {
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

    startHealthMonitoring() {
        setInterval(async () => {
            if (!this.isRunning) return;
            
            const isHealthy = await this.checkHealth();
            
            if (isHealthy) {
                this.log('✅ Health check passed');
                this.restartCount = 0; // Reset restart count on successful check
            } else {
                this.log('❌ Health check failed - Restarting server...');
                this.restart();
            }
        }, this.checkInterval);
    }

    async restart() {
        this.log('🔄 Restarting server...');
        await this.stop();
        setTimeout(() => this.start(), 2000);
    }

    async stop() {
        this.log('🔄 Stopping server...');
        this.isRunning = false;
        
        if (this.serverProcess) {
            this.serverProcess.kill('SIGTERM');
            
            // Force kill after 10 seconds
            setTimeout(() => {
                if (this.serverProcess && !this.serverProcess.killed) {
                    this.serverProcess.kill('SIGKILL');
                }
            }, 10000);
        }
        
        await this.killExistingProcesses();
        this.log('✅ Server stopped');
    }
}

// Handle graceful shutdown
const service = new ServiceWrapper();

process.on('SIGINT', async () => {
    console.log('\n📡 SIGINT received. Shutting down service...');
    await service.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n📡 SIGTERM received. Shutting down service...');
    await service.stop();
    process.exit(0);
});

// Start the service
service.start().catch((error) => {
    console.error('❌ Failed to start service:', error);
    process.exit(1);
});

console.log('🛡️ Du Lich Tra Vinh Service Wrapper started');
console.log('📊 Logs: service.log');
console.log('🔄 Press Ctrl+C to stop');
