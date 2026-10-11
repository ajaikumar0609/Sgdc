import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.FRONTEND_URL || 'https://shasthiguru.com';

  const routes = [
    '',
    '/admission',
    '/admission-query',
    '/programs',
    '/counseling',
    '/enquiry',
    '/student-welfare',
    '/donate',
    '/about',
    '/impact',
    '/news',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/data-consent',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/admission-query' || route === '/programs' ? 0.9 : 0.7,
  }));
}
