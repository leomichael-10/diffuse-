'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar.js'
import { formatPrice } from '../../lib/format.js'

export default function BundlesPage() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bundles')
      .then(r => r.json())
      .then(d => setBundles(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function addBundle(bundle) {
    const cart = JSON.parse(localStorage.getItem('diffuse_cart') || '[]')
    const existing = cart.find(i => i.bundleId === bundle.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        bundleId: bundle.id,
        name: bundle.name,
        price: Number(bundle.priceAed),
        imageUrl: bundle.imageUrl || bundle.items?.[0]?.variant?.product?.images?.[0]?.url || '',
        quantity: 1,
        isBundle: true,
      })
    }
    localStorage.setItem('diffuse_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    alert(`"${bundle.name}" added to cart!`)
  }

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-height)' }}>
        <section style={{ borderBottom: '1px solid var(--gray-300)', padding: '4rem 0 2.5rem' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Value Sets</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
              fontWeight: 300,
              letterSpacing: '0.04em',
              color: 'var(--black)',
            }}>
              Bundles
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.75rem', maxWidth: '480px' }}>
              Curated sets at special prices — everything you need, together.
            </p>
          </div>
        </section>

        <section style={{ padding: '4rem 0' }}>
          <div className="section">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '4/3' }} className="shimmer" />
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ height: '14px', width: '60%' }} className="shimmer" />
                      <div style={{ height: '12px', width: '35%' }} className="shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bundles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gray-500)' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 300, marginBottom: '1.5rem' }}>
                  No bundles available yet
                </p>
                <Link href="/products" className="btn btn-outline btn-sm">Shop Individual Items</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {bundles.map(bundle => {
                  const img = bundle.imageUrl || bundle.items?.[0]?.variant?.product?.images?.[0]?.url
                  const productCount = bundle.items?.length || 0
                  return (
                    <div key={bundle.id} style={{
                      border: '1px solid var(--gray-200)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      {/* Image */}
                      <div style={{
                        aspectRatio: '4/3',
                        background: img ? `url(${img}) center/cover` : 'var(--gray-100)',
                        position: 'relative',
                      }}>
                        {!img && (
                          <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'var(--gray-400)', fontSize: '0.75rem', letterSpacing: '0.1em',
                          }}>
                            BUNDLE
                          </div>
                        )}
                        <div style={{
                          position: 'absolute', top: '1rem', left: '1rem',
                          background: 'var(--black)', color: '#fff',
                          fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                          padding: '0.3rem 0.6rem',
                        }}>
                          {productCount} {productCount === 1 ? 'item' : 'items'}
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <p style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.04em', color: 'var(--black)', marginBottom: '0.25rem' }}>
                            {bundle.name}
                          </p>
                          {bundle.description && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>
                              {bundle.description}
                            </p>
                          )}
                        </div>

                        {/* Items list */}
                        {bundle.items?.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {bundle.items.map(item => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gray-400)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                  {item.variant?.product?.name}
                                  {item.variant?.size ? ` — ${item.variant.size}` : ''}
                                  {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400 }}>
                            {formatPrice(bundle.priceAed)}
                          </span>
                          <button
                            onClick={() => addBundle(bundle)}
                            className="btn btn-black btn-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
