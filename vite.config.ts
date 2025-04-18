import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, `./src/back-end/mcp/tools/_tools-schema.yml`),
          dest: path.resolve(__dirname, `./dist/back-end/mcp/tools/`)
        },
        {
          src: path.resolve(__dirname, './src/back-end/mcp/resources/_resources-schema.yml'),
          dest: path.resolve(__dirname, `./dist/back-end/mcp/resources/`)
        }
      ]
    })
  ],
  root: 'src/front-end',
  build: {
    outDir: '../../dist/public',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/front-end')
    }
  },
  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
