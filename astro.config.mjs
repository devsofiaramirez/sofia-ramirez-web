import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://sofiaramirez.co',
  output: 'static', // SSR híbrido: estático por defecto, `export const prerender = false` en /admin y /api
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [
    sitemap({
      // Sin esto el panel entra al mapa del sitio. /cotizar solo existe con el cotizador prendido:
      // lo anuncia sitemap-services.xml cuando corresponde.
      filter: (page) => !/\/(admin|cotizar)(\/|$)/.test(new URL(page).pathname),
      // Igual que las canónicas: sin barra al final.
      serialize: (item) => ({ ...item, url: item.url.replace(/(?<=[^/])\/$/, '').replace(/^(https:\/\/[^/]+)$/, '$1/') }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  },
});
