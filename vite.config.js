import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages project site: https://antirek.github.io/markdown-viewer/
const pagesBase = '/markdown-viewer/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? pagesBase : '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        id: pagesBase,
        name: 'Markdown Viewer',
        short_name: 'MD Viewer',
        description: 'Read-only markdown viewer for local .md files',
        lang: 'ru',
        start_url: './?source=pwa',
        scope: './',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#e7eef2',
        theme_color: '#e7eef2',
        categories: ['utilities', 'productivity'],
        prefer_related_applications: false,
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        file_handlers: [
          {
            action: pagesBase,
            accept: {
              'text/markdown': ['.md', '.markdown', '.mdown', '.mkd', '.mdx'],
              'text/x-markdown': ['.md', '.markdown', '.mdown', '.mkd'],
              'text/plain': ['.md', '.markdown', '.mdown', '.mkd'],
              'application/octet-stream': ['.md', '.markdown'],
            },
            launch_type: 'single-client',
          },
        ],
        // navigate-new: each OS file open gets a fresh client with launchQueue files
        launch_handler: {
          client_mode: 'navigate-new',
        },
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Mermaid chunks are large; keep them out of the install precache.
        maximumFileSizeToCacheInBytes: 1.5 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
}));
