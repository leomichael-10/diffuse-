const BASE = 'https://diffuse-egypt3.vercel.app'

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const res  = await fetch(`${BASE}/api/products/${id}`, { cache: 'no-store' })
    if (!res.ok) return { title: 'Product Not Found — Diffuse Egypt' }
    const product = await res.json()
    if (!product || !product.name) return { title: 'Product Not Found — Diffuse Egypt' }

    const image = product.images?.[0]?.url || product.variants?.[0]?.image || null
    const desc  = product.description ||
      `Shop ${product.name} by ${product.brand || 'Diffuse'}. Available in multiple sizes and colors. Free delivery across Egypt.`

    return {
      title: `${product.name} — Diffuse Egypt`,
      description: desc,
      openGraph: {
        title:       `${product.name} — Diffuse Egypt`,
        description: desc,
        url:         `${BASE}/products/${id}`,
        type:        'website',
        images:      image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
      },
      twitter: {
        card:   'summary_large_image',
        title:  `${product.name} — Diffuse Egypt`,
        images: image ? [image] : [],
      },
      alternates: { canonical: `${BASE}/products/${id}` },
    }
  } catch {
    return { title: 'Product — Diffuse Egypt' }
  }
}

export default function ProductLayout({ children }) {
  return children
}
