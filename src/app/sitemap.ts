import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://bluff-haven.vercel.app'
  return [
    { url: base,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/book`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
