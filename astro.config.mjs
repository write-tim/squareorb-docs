import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Square Orb Documentation',
      logo: {
        src: './src/assets/square-orb-logo.png',
      },
      favicon: '/square-orb-logo.png',
      customCss: [
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Gallery Management',
          autogenerate: { directory: 'gallery-management' },
        },
        {
          label: 'Workflow & Cloud Sync',
          autogenerate: { directory: 'cloud-workflows' },
        },
        {
          label: 'Metadata & Protection',
          autogenerate: { directory: 'metadata-protection' },
        },
        {
          label: 'Back to Portfolio',
          link: 'https://timothyjohnsonwrites.com',
        },
      ],
    }),
  ],
});
