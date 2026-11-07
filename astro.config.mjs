import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://harshgujarathi.com',
  integrations: [
    mdx(),
    // Keep error and placeholder pages out of the sitemap (they are also noindex).
    sitemap({ filter: (page) => !/\/(404|coming-soon)\/?$/.test(new URL(page).pathname) }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
