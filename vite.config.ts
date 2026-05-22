import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

/** 生产环境通过 Nginx 挂载在 https://domain/map/ */
const appBase = '/map/'

const config = defineConfig({
  base: appBase,
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      baseURL: appBase,
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
