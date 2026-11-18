import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `vite build --mode artifact` makes a build for sandboxed hosts (e.g. a claude.ai artifact):
// relative URLs, no service worker, fonts inlined into the CSS.
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact'
  // ATLAS_BASE serves the app from a sub-path, e.g. "/graphify/" on GitHub Pages.
  const base = artifact ? './' : (process.env.ATLAS_BASE ?? '/')
  return {
    base,
    plugins: [
      react(),
      // Sandboxed hosts only allow data: images, so drop the favicon links there.
      artifact && {
        name: 'atlas-artifact-html',
        transformIndexHtml: (html: string) => html.replace(/\s*<link rel="(icon|apple-touch-icon)"[^>]*>/g, ''),
      },
      !artifact &&
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
          manifest: {
            name: 'Atlas',
            short_name: 'Atlas',
            description: 'Learn anatomy in 3D by typing the names of structures.',
            theme_color: '#171614',
            background_color: '#171614',
            display: 'standalone',
            orientation: 'portrait',
            start_url: base,
            scope: base,
            icons: [
              { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            // App shell, fonts, content chunks and the Draco decoder are precached,
            // so the app works offline after the first visit.
            globPatterns: ['**/*.{js,css,html,woff2,svg,png,wasm}'],
            navigateFallback: `${base}index.html`,
            runtimeCaching: [
              {
                // Plate images: cached the first time each plate is opened.
                urlPattern: ({ url }) => url.pathname.startsWith(`${base}plates/`),
                handler: 'CacheFirst',
                options: {
                  cacheName: 'atlas-plates',
                  expiration: { maxEntries: 40 },
                  cacheableResponse: { statuses: [200] },
                },
              },
              {
                // 3D models are large: cache each module's GLB the first time it is opened.
                urlPattern: ({ url }) => url.pathname.startsWith(`${base}models/`),
                handler: 'CacheFirst',
                options: {
                  cacheName: 'atlas-models',
                  expiration: { maxEntries: 30 },
                  cacheableResponse: { statuses: [200] },
                },
              },
            ],
          },
        }),
    ],
    build: {
      // three.js + R3F is ~1 MB (≈270 KB gzipped) and is lazy-loaded only when a 3D view opens.
      chunkSizeWarningLimit: 1100,
      ...(artifact ? { outDir: 'dist-artifact', assetsInlineLimit: 400_000 } : {}),
    },
    }
})
