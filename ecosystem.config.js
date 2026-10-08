module.exports = {
  apps: [
    {
      name: "auroka",
      cwd: "/home/ubuntu/projects/auroka",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 7192 -H 127.0.0.1",
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
      error_file: "/home/ubuntu/projects/auroka/logs/pm2-error.log",
      out_file: "/home/ubuntu/projects/auroka/logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
