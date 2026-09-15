import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

function cleanFrontmatter(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(cleanFrontmatter);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      result[key] = typeof value === 'object' ? cleanFrontmatter(value) : value;
    }
  }

  if (result.sidebar && typeof result.sidebar === 'object' && !Array.isArray(result.sidebar)) {
    const sidebar = result.sidebar as Record<string, unknown>;
    if (sidebar.badge && typeof sidebar.badge === 'object' && !Array.isArray(sidebar.badge)) {
      const badge = sidebar.badge as Record<string, unknown>;
      if (!badge.text || (typeof badge.text === 'string' && badge.text.trim() === '')) {
        delete sidebar.badge;
      }
    }
  }

  return result;
}

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: (context) => z.preprocess((val) => cleanFrontmatter(val), docsSchema()(context)),
  }),
};

