module.exports = {
  apps: [{
    name: 'aws-cost-optimizer-backend',
    script: './server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    watch: false, // Set to true for development
    ignore_watch: [
      'node_modules',
      'logs',
      '.git'
    ],
    max_restarts: 10,
    min_uptime: '10s',
    autorestart: true,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Health monitoring
    exp_backoff_restart_delay: 100
  }]
};
