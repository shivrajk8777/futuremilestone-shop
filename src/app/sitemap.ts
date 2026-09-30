import type { MetadataRoute } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { blogPosts } from '@/data/blog';

export const revalidate = 86400; // Revalidate sitemap once every 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.futuremilestone.shop';

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/licensing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic Product pages from MongoDB
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = await getDatabase();
    const products = await db
      .collection('products')
      .find({}, { projection: { slug: 1, updatedAt: 1 } })
      .toArray();

    productRoutes = products
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${baseUrl}/shop/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch (error) {
    console.error('Error generating product sitemap:', error);
  }

  // Dynamic Blog pages from MongoDB + local fallback
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = await getDatabase();
    const blogs = await db
      .collection('blogs')
      .find({}, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
      .toArray();

    const dbBlogSlugs = new Set<string>();
    blogs.forEach((b) => {
      if (b.slug) {
        dbBlogSlugs.add(b.slug);
        blogRoutes.push({
          url: `${baseUrl}/blog/${b.slug}`,
          lastModified: b.updatedAt
            ? new Date(b.updatedAt)
            : b.createdAt
            ? new Date(b.createdAt)
            : new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });

    // Include local blog posts if not already present in DB
    blogPosts.forEach((post) => {
      if (!dbBlogSlugs.has(post.slug)) {
        blogRoutes.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    blogRoutes = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
