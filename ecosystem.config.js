module.exports = {
  apps: [
    {
      name: "auroka",

      cwd: "/www/wwwroot/Auroka/auroka-frontend/auroka",

      script: "npm",
      args: "start",
      interpreter: "none",

      env: {
        NODE_ENV: "production",
        PORT: 7192,
        HOSTNAME: "127.0.0.1"
      },

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      max_memory_restart: "1G",

      time: true,

      error_file: "/www/wwwroot/Auroka/auroka-frontend/auroka/logs/pm2-error.log",
      out_file: "/www/wwwroot/Auroka/auroka-frontend/auroka/logs/pm2-out.log",

      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};