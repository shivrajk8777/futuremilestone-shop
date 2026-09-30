import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/orders', '/api/'],
    },
    sitemap: 'https://www.futuremilestone.shop/sitemap.xml',
  };
}
