'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar.js'
import { formatPrice } from '../../lib/format.js'

export default function WishlistPage() {
  const router  = useRouter()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login?redirect=/wishlist'); return }

    fetch('/api/wishlist')
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function remove(productId) {
    setItems(prev => prev.filter(i => i.productId !== productId))
    await fetch('/api/wishlist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId }),
    })
  }

  function addToCart(item) {
    const variant = item.product?.variants?.[0]
    if (!variant) return
    const cart = JSON.parse(localStorage.getItem('diffuse_cart') || '[]')
    const idx  = cart.findIndex(c => c.variantId === variant.id)
    if (idx > -1) {
      cart[idx].qty      = (cart[idx].qty      || 1) + 1
      cart[idx].quantity = (cart[idx].quantity  || 1) + 1
    } else {
      cart.push({
        variantId: variant.id,
        productId: item.product.id,
        name:      item.product.name,
        image:     item.product.images?.[0]?.url || '',
        size:      variant.size,
        color:     variant.color,
        price:     Number(variant.priceAed),
        qty:       1,
        quantity:  1,
      })
    }
    localStorage.setItem('diffuse_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <>
      <Navbar />
      <div className="page-body">
        {/* Header */}
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2.5rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Account</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              Wishlist
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 3rem)' }}>
          {loading ? (
            <div className="product-grid">
              {[1,2,3,4].map(i => (
                <div key={i} style={{ padding: '0.5rem' }}>
                  <div style={{ aspectRatio: '3/4' }} className="shimmer" />
                  <div style={{ padding: '0.875rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ height: '12px', width: '65%' }} className="shimmer" />
                    <div style={{ height: '12px', width: '30%' }} className="shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--gray-400)', marginBottom: '2rem' }}>
                Your wishlist is empty
              </p>
              <Link href="/products" className="btn btn-black btn-sm">Discover Products</Link>
            </div>
          ) : (
            <div className="product-grid">
              {items.map(item => {
                const product = item.product
                const variant = product?.variants?.[0]
                const img     = product?.images?.[0]?.url || product?.variants?.find(v => v.image)?.image || null
                return (
                  <div key={item.id} style={{ padding: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                      <Link href={`/products/${product.id}`} style={{ display: 'block', aspectRatio: '3/4', background: 'var(--gray-100)', overflow: 'hidden', position: 'relative' }}>
                        {img && (
                          <Image src={img} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
                        )}
                      </Link>
                      {/* Remove button */}
                      <button onClick={() => remove(item.productId)}
                        style={{
                          position: 'absolute', top: '0.75rem', right: '0.75rem',
                          width: '32px', height: '32px',
                          background: 'rgba(255,255,255,0.9)',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', color: 'var(--gray-500)',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
                        title="Remove from wishlist">
                        ×
                      </button>
                    </div>
                    <div style={{ padding: '0.875rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <Link href={`/products/${product.id}`} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 400, color: 'var(--black)', letterSpacing: '0.01em', marginBottom: '0.25rem' }}>
                          {product.name}
                        </Link>
                        {variant && (
                          <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{formatPrice(variant.priceAed)}</p>
                        )}
                      </div>
                      {variant && (
                        <button onClick={() => addToCart(item)}
                          className="btn btn-black"
                          style={{ fontSize: '0.55rem', letterSpacing: '0.14em', padding: '0.5rem 0.875rem', flexShrink: 0 }}>
                          Add to Bag
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
