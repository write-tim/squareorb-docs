import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  // Your GitHub Pages URL
  site: 'https://docs.timothyjohnsonwrites.com',

  integrations: [
    starlight({
      title: 'Knowledge Base',
      favicon: '/tjw_logo.png',
      head: [
        // 1. Load the Google Analytics script
        {
          tag: 'script',
          attrs: {
            src: 'https://www.googletagmanager.com/gtag/js?id=G-6JPFC14SP9',
            async: true,
          },
        },
        // 2. Initialize the tracker
        {
          tag: 'script',
          content: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6JPFC14SP9');
          `,
        },
      ],
      logo: {
        src: './src/assets/tjw_logo.png',
      },
      social: {
        github: 'https://github.com/write-tim/sveltia-docs-test',
        linkedin: 'https://www.linkedin.com/in/timothy-michael-johnson/',
      },
      editLink: {
        baseUrl: 'https://github.com/write-tim/sveltia-docs-test/edit/main/',
      },
      credits: true,
      customCss: [
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Gallery Layouts',
          autogenerate: { directory: 'gallery-layouts' },
        },
        {
          label: 'Workflow & Cloud Sync',
          autogenerate: { directory: 'cloud-workflows' },
        },
        {
          label: 'Metadata & Protection',
          autogenerate: { directory: 'metadata-protection' },
        },
        // You can keep the "Back to Portfolio" link at the bottom if you'd like!
        {
          label: 'Back to Portfolio',
          link: 'https://timothyjohnsonwrites.com',
        },
      ],
});
