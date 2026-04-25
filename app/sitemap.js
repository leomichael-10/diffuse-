import prisma from '../lib/prisma.js'

export default async function sitemap() {
  const baseUrl = 'https://diffuse-egypt3.vercel.app'

  const products = await prisma.product.findMany({
    where:  { isActive: true },
    select: { id: true, updatedAt: true },
  })

  const productUrls = products.map(p => ({
    url:             `${baseUrl}/products/${p.id}`,
    lastModified:    p.updatedAt,
    changeFrequency: 'weekly',
    priority:        0.8,
  }))

  return [
    { url: baseUrl,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${baseUrl}/products`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/bundles`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/returns`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...productUrls,
  ]
}
