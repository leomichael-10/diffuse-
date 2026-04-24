'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { formatPrice } from '../lib/format.js'

export default function ProductCard({ product }) {
  const [showSizes, setShowSizes] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const images   = product.images   || []
  const variants = product.variants || []
  const prices   = variants.map(v => Number(v.priceAed)).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : 0

  const sizes  = [...new Set(variants.map(v => v.size).filter(Boolean))]
  const colors = variants.reduce((acc, v) => {
    if (v.colorHex && !acc.find(c => c.colorHex === v.colorHex)) {
      acc.push({ color: v.color, colorHex: v.colorHex })
    }
    return acc
  }, []).slice(0, 6)

  // Average rating from reviews if present
  const reviews    = product.reviews || []
  const avgRating  = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : (product.avgRating || 0)
  const ratingCount = product.reviewCount || reviews.length

  const img1 = images[0]?.url
  const img2 = images[1]?.url

  function addToCart(size) {
    const variant = variants.find(v => v.size === size && v.stockQty > 0) ||
                    variants.find(v => v.size === size) ||
                    variants[0]
    if (!variant) return

    const cart = JSON.parse(localStorage.getItem('diffuse_cart') || '[]')
    const idx  = cart.findIndex(i => i.variantId === variant.id)
    const item = {
      variantId: variant.id,
      productId: product.id,
      name:      product.name,
      brand:     product.brand || 'Diffuse',
      size:      variant.size,
      color:     variant.color,
      colorHex:  variant.colorHex,
      price:     Number(variant.priceAed),
      qty:       1,
      quantity:  1,
      image:     img1 || null,
    }
    if (idx >= 0) { cart[idx].qty = (cart[idx].qty || 0) + 1; cart[idx].quantity = cart[idx].qty }
    else cart.push(item)
    localStorage.setItem('diffuse_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setShowSizes(false)
    toast.success('Added to bag')
  }

  function handleQuickAdd(e) {
    e.preventDefault()
    if (sizes.length > 1) setShowSizes(s => !s)
    else addToCart(sizes[0])
  }

  async function toggleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { window.location.href = '/login'; return }
    try {
      const res  = await fetch('/api/wishlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setWishlisted(data.added)
        toast.success(data.added ? 'Saved to wishlist' : 'Removed from wishlist')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="product-card">
      {/* Image */}
      <Link href={`/products/${product.id}`} style={{ display: 'block' }}>
        <div className="product-card-image">
          {img1 ? (
            <>
              <Image src={img1} alt={product.name} fill
                sizes="(max-width:768px) 50vw, 25vw"
                style={{ objectFit: 'cover' }} className="img-primary" />
              {img2 && (
                <Image src={img2} alt="" fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }} className="img-secondary" />
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--gray-400)', letterSpacing: '0.2em' }}>
                {(product.name || '').charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Wishlist heart */}
          <button
            onClick={toggleWishlist}
            style={{
              position: 'absolute', top: '0.625rem', right: '0.625rem',
              width: '30px', height: '30px',
              background: 'rgba(255,255,255,0.88)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
              transition: 'background 0.2s',
            }}
            title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={wishlisted ? '#111' : 'none'}
              stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* Quick-add */}
          {!showSizes ? (
            <button className="product-card-quick-add" onClick={handleQuickAdd} tabIndex={-1}>
              Add to Bag
            </button>
          ) : (
            <div className="product-card-sizes" onClick={e => e.preventDefault()}>
              {sizes.map(s => {
                const v   = variants.find(v => v.size === s)
                const oos = !v || v.stockQty === 0
                return (
                  <button key={s}
                    onClick={e => { e.preventDefault(); !oos && addToCart(s) }}
                    className={`size-btn${oos ? ' size-btn-oos' : ''}`}
                    style={{ width: '36px', height: '36px', fontSize: '0.6rem' }}>
                    {s}
                  </button>
                )
              })}
              <button onClick={e => { e.preventDefault(); setShowSizes(false) }}
                style={{ position: 'absolute', top: '6px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontSize: '1.1rem', lineHeight: 1 }}>
                ×
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <Link href={`/products/${product.id}`} style={{ display: 'block' }}>
        <div className="product-card-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--black)', lineHeight: 1.45, letterSpacing: '0.01em' }}>
              {product.name}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--black)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {formatPrice(minPrice)}
            </span>
          </div>

          {/* Rating */}
          {avgRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="9" height="9" viewBox="0 0 24 24"
                    fill={i <= Math.round(avgRating) ? '#C9A96E' : 'none'}
                    stroke="#C9A96E" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--gray-400)', letterSpacing: '0.04em' }}>
                {avgRating} ({ratingCount})
              </span>
            </div>
          )}

          {/* Color dots */}
          {colors.length > 1 && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '0.6rem', alignItems: 'center' }}>
              {colors.map((c, i) => (
                <div key={i} title={c.color} style={{
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: c.colorHex || '#ccc',
                  border: c.colorHex === '#FFFFFF' ? '1px solid var(--gray-300)' : 'none',
                  flexShrink: 0,
                }} />
              ))}
              {colors.length > 5 && (
                <span style={{ fontSize: '0.6rem', color: 'var(--gray-500)' }}>+{colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
