'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar.js'
import ProductCard from '../components/ProductCard.js'

/* ── Category data ───────────────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Men',
    sub:   'Essentials & Outerwear',
    href:  '/products?gender=Men',
    bg:    '#ECEAE6',
    img:   'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=900&q=80',
  },
  {
    label: 'Women',
    sub:   'Ready to Wear',
    href:  '/products?gender=Women',
    bg:    '#E8E3DC',
    img:   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
  },
  {
    label: 'New In',
    sub:   'Latest Arrivals',
    href:  '/products',
    bg:    '#E2DDD7',
    img:   'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80',
  },
  {
    label: 'Accessories',
    sub:   'Bags & More',
    href:  '/products?categoryId=6',
    bg:    '#DDD8D2',
    img:   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',
  },
]

function BundlesStrip() {
  const [bundles, setBundles] = useState([])
  useEffect(() => {
    fetch('/api/bundles').then(r => r.json()).then(d => setBundles(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {})
  }, [])

  if (bundles.length === 0) return null

  return (
    <section style={{ borderTop: '1px solid var(--gray-300)', padding: '6rem 0' }}>
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-300)' }}>
          <div>
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Value Sets</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 300, letterSpacing: '0.04em', color: 'var(--black)' }}>
              Bundles
            </h2>
          </div>
          <Link href="/bundles" style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '2px' }}>
            View All
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {bundles.map(b => {
            const img = b.imageUrl || b.items?.[0]?.variant?.product?.images?.[0]?.url
            return (
              <Link key={b.id} href="/bundles" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '4/3', background: img ? `url(${img}) center/cover` : 'var(--gray-100)' }} />
                <div style={{ padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.25rem' }}>{b.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontFamily: 'var(--font-serif)' }}>
                    EGP {Number(b.priceAed).toLocaleString('en-EG')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/products?featured=true&limit=4')
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : []
        if (items.length < 4) {
          return fetch('/api/products?limit=4')
            .then(r => r.json())
            .then(all => setFeatured(Array.isArray(all) ? all.slice(0, 4) : []))
        }
        setFeatured(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />

      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100dvh',
        display:   'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--white)',
        textAlign: 'center',
        padding: '0 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative thin lines */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '1px', height: '100%', background: 'var(--gray-200)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Season label */}
          <p className="t-label anim-fade-up" style={{ marginBottom: '2.5rem', color: 'var(--gray-500)' }}>
            New Season — SS 2026
          </p>

          {/* Brand name — Cormorant Garamond */}
          <h1 className="t-hero anim-fade-up anim-fade-up-delay-1" style={{ color: 'var(--black)' }}>
            Diffuse
          </h1>

          {/* Tagline */}
          <p className="anim-fade-up anim-fade-up-delay-2" style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            fontWeight: 300,
            letterSpacing: '0.06em',
            color: 'var(--gray-500)',
            marginTop: '1.75rem',
            marginBottom: '3.5rem',
          }}>
            Wear the Difference
          </p>

          {/* CTA */}
          <div className="anim-fade-up anim-fade-up-delay-3"
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn btn-black btn-lg">
              Shop Now
            </Link>
            <Link href="/products?sort=new" className="btn btn-outline btn-lg">
              New In
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="anim-fade-up anim-fade-up-delay-4" style={{
          position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Scroll</span>
          <div style={{ width: '1px', height: '40px', background: 'var(--gray-300)', animation: 'fadeIn 2s ease infinite alternate' }} />
        </div>
      </section>

      {/* ── 2. CATEGORY TILES ───────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--gray-300)' }}>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.label} href={cat.href} className="category-tile">
              {/* Background image */}
              <div className="category-tile-bg" style={{
                backgroundImage: `url(${cat.img})`,
                backgroundSize:  'cover',
                backgroundPosition: 'center',
              }} />
              {/* Overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.15)',
                transition: 'background 0.4s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
              />
              {/* Label */}
              <div className="category-tile-label">
                <p style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>
                  {cat.sub}
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff' }}>
                  {cat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. MARQUEE STRIP ────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid var(--gray-300)',
        borderBottom: '1px solid var(--gray-300)',
        overflow: 'hidden',
        padding: '1rem 0',
        background: 'var(--black)',
      }}>
        <div style={{
          display: 'flex', gap: '5rem',
          animation: 'marquee 20s linear infinite',
          width: 'max-content',
          whiteSpace: 'nowrap',
        }}>
          {Array(4).fill(null).map((_, i) => (
            <span key={i} style={{ display: 'flex', gap: '5rem' }}>
              {['Free Delivery Over EGP 500', 'New Season 2026', 'Quality Basics', 'Timeless Style', 'Wear the Difference'].map(t => (
                <span key={t} style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                  {t} <span style={{ color: 'var(--sand)', margin: '0 1rem' }}>—</span>
                </span>
              ))}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-25%) } }`}</style>
      </div>

      {/* ── 4. NEW ARRIVALS ─────────────────────────────────────── */}
      <section style={{ padding: '6rem 0' }}>
        <div className="section">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginBottom: '3rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--gray-300)',
          }}>
            <div>
              <p className="t-label" style={{ marginBottom: '0.75rem' }}>Curated Selection</p>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
                fontWeight: 300,
                letterSpacing: '0.04em',
                color: 'var(--black)',
              }}>
                New Arrivals
              </h2>
            </div>
            <Link href="/products" style={{
              fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '2px',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.target.style.opacity = '0.5'}
              onMouseLeave={e => e.target.style.opacity = '1'}>
              View All
            </Link>
          </div>

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
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--gray-500)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 300, marginBottom: '1.5rem' }}>
                No products yet
              </p>
              <Link href="/admin" className="btn btn-outline btn-sm">Add Products</Link>
            </div>
          ) : (
            <div className="product-grid">
              {featured.map(p => (
                <div key={p.id} style={{ padding: '0.5rem' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. BUNDLES ──────────────────────────────────────────── */}
      <BundlesStrip />

      {/* ── 5b. EDITORIAL STATEMENT ─────────────────────────────── */}
      <section style={{
        borderTop: '1px solid var(--gray-300)',
        background: 'var(--gray-100)',
        padding: '10rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p className="t-label" style={{ marginBottom: '2.5rem' }}>Our Philosophy</p>
          <blockquote style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            lineHeight: 1.45,
            color: 'var(--black)',
            marginBottom: '2.5rem',
          }}>
            "Clothing designed with purpose,<br />made to endure."
          </blockquote>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            color: 'var(--gray-500)',
            lineHeight: 1.9,
            maxWidth: '460px',
            margin: '0 auto 3rem',
            fontWeight: 400,
          }}>
            We believe in quality basics — pieces that transcend seasons,
            built from considered materials, and designed for a lifetime of wear.
          </p>
          <Link href="/products" className="btn btn-outline">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* ── 6. FEATURES BAR ─────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--gray-300)', padding: '4rem 0' }}>
        <div className="section">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1px',
            background: 'var(--gray-300)',
          }}>
            {[
              { title: 'Free Delivery', sub: 'On orders over EGP 500' },
              { title: 'Premium Quality', sub: 'Carefully selected materials' },
              { title: 'Easy Returns', sub: '14-day return policy' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--white)',
                padding: '2.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, letterSpacing: '0.02em', marginBottom: '0.5rem' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', letterSpacing: '0.06em' }}>
                  {f.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="section">
          <div className="footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '3rem',
            marginBottom: '4rem',
          }}>
            {/* Brand */}
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: 400,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'var(--black)',
                marginBottom: '1.25rem',
              }}>
                Diffuse
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.85, maxWidth: '220px' }}>
                Premium minimal clothing. Quality basics for a considered wardrobe.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Shop',
                links: [['All Products', '/products'], ['New In', '/products'], ['Men', '/products?gender=Men'], ['Women', '/products?gender=Women']],
              },
              {
                title: 'Account',
                links: [['Sign In', '/login'], ['Register', '/register'], ['My Orders', '/orders'], ['Wishlist', '/wishlist']],
              },
              {
                title: 'Info',
                links: [['Contact', '/contact'], ['Returns', '/returns'], ['About', '/about'], ['Terms', '/terms']],
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--black)', marginBottom: '1.25rem' }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href}
                      style={{ fontSize: '0.78rem', color: 'var(--gray-500)', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--black)'}
                      onMouseLeave={e => e.target.style.color = 'var(--gray-500)'}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid var(--gray-300)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
              © 2026 Diffuse Egypt. All rights reserved.
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
              Free delivery on orders over EGP 500
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
