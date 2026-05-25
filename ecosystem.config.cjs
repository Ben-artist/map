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
      // PM2 不读取 env_file；用 Node 22 的 --env-file 加载同目录下的 .env
      node_args: '--env-file=.env',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3000',
        NITRO_APP_BASE_URL: '/map/',
      },
    },
  ],
}
