const path = require('node:path')

/** @type {import('pm2').StartOptions[]} */
module.exports = {
  apps: [
    {
      name: 'china',
      script: '.output/server/index.mjs',
      cwd: path.dirname(__filename),
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3000',
        NITRO_APP_BASE_URL: '/map/',
      },
    },
  ],
}
