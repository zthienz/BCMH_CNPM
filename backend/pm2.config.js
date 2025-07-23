module.exports = {
  apps: [{
    name: 'dulich-travinh-api',
    script: 'restful-api-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Restart strategies
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Cron restart (daily at 3 AM)
    cron_restart: '0 3 * * *'
  }]
};
