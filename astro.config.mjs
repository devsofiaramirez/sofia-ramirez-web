import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://sofiaramirez.co',
  output: 'static', // SSR híbrido: estático por defecto, `export const prerender = false` en /admin y /api
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  },
});
