module.exports = {
  apps: [
    {
      name: 'suncerest-admin',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
