'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../../components/Navbar.js'
import ProductCard from '../../../components/ProductCard.js'
import { formatPrice, DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../../lib/format.js'

export default function ProductPage() {
  const { id }  = useParams()
  const router  = useRouter()

  const [product,    setProduct]    = useState(null)
  const [related,    setRelated]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeImg,  setActiveImg]  = useState(0)

  const [selSize,    setSelSize]    = useState(null)
  const [selColor,   setSelColor]   = useState(null)
  const [selVar,     setSelVar]     = useState(null)

  const [addMsg,     setAddMsg]     = useState('')
  const [wishlisted, setWishlisted] = useState(false)
  const [wishPending, setWishPending] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' })
  const [reviewDone, setReviewDone] = useState(false)
  const [openSection, setOpenSection] = useState('description')

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoading(false); return }
        setProduct(d)
        const first = d.variants?.[0]
        if (first) { setSelSize(first.size); setSelColor(first.color); setSelVar(first) }
        setLoading(false)
        if (d.categoryId) {
          fetch(`/api/products?categoryId=${d.categoryId}&limit=5`)
            .then(r => r.json())
            .then(rel => setRelated((Array.isArray(rel) ? rel : []).filter(p => p.id !== d.id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!product?.variants) return
    const v = product.variants.find(v =>
      (selSize  ? v.size  === selSize  : true) &&
      (selColor ? v.color === selColor : true)
    ) || product.variants.find(v => v.size === selSize) || product.variants[0]
    setSelVar(v || null)
  }, [selSize, selColor, product])

  function addToCart() {
    if (!selVar) return
    const image = product.images?.[0]?.url || null
    const item  = {
      variantId: selVar.id,
      productId: product.id,
      name:      product.name,
      brand:     product.brand || 'Diffuse',
      size:      selVar.size,
      color:     selVar.color,
      colorHex:  selVar.colorHex,
      price:     Number(selVar.priceAed),
      qty:       1,
      quantity:  1,
      image,
    }
    const cart = JSON.parse(localStorage.getItem('diffuse_cart') || '[]')
    const idx  = cart.findIndex(i => i.variantId === selVar.id)
    if (idx >= 0) { cart[idx].qty = (cart[idx].qty || 0) + 1; cart[idx].quantity = cart[idx].qty }
    else cart.push(item)
    localStorage.setItem('diffuse_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setAddMsg('Added to Bag')
    setTimeout(() => setAddMsg(''), 2200)
  }

  useEffect(() => {
    if (!id) return
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) return
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setWishlisted(d.some(i => i.productId === Number(id)))
      })
      .catch(() => {})
  }, [id])

  async function toggleWishlist() {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login'); return }
    setWishPending(true)
    try {
      const res  = await fetch('/api/wishlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId: Number(id) }),
      })
      const data = await res.json()
      if (res.ok) setWishlisted(data.added)
    } catch {}
    setWishPending(false)
  }

  async function submitReview(e) {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login'); return }
    await fetch('/api/reviews', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: product.id, ...reviewForm }),
    })
    setReviewDone(true)
  }

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - var(--nav-height))' }}>
          <div className="shimmer" />
          <div style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '12px', width: '30%' }} className="shimmer" />
            <div style={{ height: '28px', width: '70%' }} className="shimmer" />
            <div style={{ height: '20px', width: '20%', marginTop: '0.5rem' }} className="shimmer" />
          </div>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="page-body" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, marginBottom: '2rem', color: 'var(--gray-500)' }}>
            Product not found
          </p>
          <Link href="/products" className="btn btn-outline btn-sm">Back to Shop</Link>
        </div>
      </>
    )
  }

  const images   = product.images   || []
  const variants = product.variants || []
  const sizes    = [...new Set(variants.map(v => v.size).filter(Boolean))]
  const colors   = variants.reduce((acc, v) => {
    if (v.color && !acc.find(c => c.color === v.color)) acc.push({ color: v.color, colorHex: v.colorHex })
    return acc
  }, [])
  const price    = selVar ? Number(selVar.priceAed) : 0
  const inStock  = selVar ? selVar.stockQty > 0 : false
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <>
      <Navbar />
      <div className="page-body">

        {/* ── Breadcrumb ── */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex', gap: '0.6rem', alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Home',  href: '/' },
            { label: 'Shop',  href: '/products' },
            product.category && { label: product.category.name, href: `/products?categoryId=${product.categoryId}` },
            { label: product.name, href: null },
          ].filter(Boolean).map((crumb, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {crumb.href ? (
                <Link href={crumb.href} style={{ fontSize: '0.65rem', letterSpacing: '0.06em', color: 'var(--gray-500)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--black)'}
                  onMouseLeave={e => e.target.style.color = 'var(--gray-500)'}>
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.06em', color: 'var(--black)' }}>{crumb.label}</span>
              )}
              {i < arr.length - 1 && <span style={{ color: 'var(--gray-300)', fontSize: '0.6rem' }}>/</span>}
            </span>
          ))}
        </div>

        {/* ── Main split ── */}
        <div className="product-detail-layout">

          {/* LEFT — Image gallery */}
          <div className="product-detail-images" style={{
            position: 'sticky',
            top: 'var(--nav-height)',
            height: 'calc(100vh - var(--nav-height))',
            overflow: 'hidden',
            background: 'var(--gray-100)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Main image */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {images[activeImg] ? (
                <Image
                  src={images[activeImg].url}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                  sizes="50vw"
                  priority
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '5rem', fontWeight: 200, letterSpacing: '0.2em', color: 'var(--gray-300)',
                  }}>
                    {(product.name || 'D').charAt(0)}
                  </span>
                </div>
              )}

              {/* Prev/Next arrows if multiple images */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--black)', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}>
                    ‹
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--black)', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}>
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{
                display: 'flex', gap: '1px', height: '82px',
                background: 'var(--gray-300)', flexShrink: 0, overflowX: 'auto',
              }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    position: 'relative', flexShrink: 0, width: '64px', height: '82px',
                    border: 'none', padding: 0, cursor: 'pointer', background: 'var(--gray-100)',
                    outline: activeImg === i ? '2px solid var(--black)' : '2px solid transparent',
                    outlineOffset: '-2px', transition: 'outline-color 0.15s',
                  }}>
                    <Image src={img.url} alt="" fill style={{ objectFit: 'cover' }} sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product details */}
          <div className="product-detail-info" style={{ padding: '4rem 4rem', overflowY: 'auto', maxHeight: 'calc(100vh - var(--nav-height))', position: 'sticky', top: 'var(--nav-height)' }}>

            {/* Brand + name */}
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: '0.875rem' }}>
              {product.brand || 'Diffuse'}
            </p>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 300,
              letterSpacing: '0.03em',
              lineHeight: 1.25,
              color: 'var(--black)',
              marginBottom: '1.25rem',
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.1rem',
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: 'var(--black)',
              marginBottom: '0.75rem',
            }}>
              {formatPrice(price)}
            </div>

            {/* Rating */}
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: '7px', height: '7px', borderRadius: '50%', background: n <= Math.round(avgRating) ? 'var(--black)' : 'var(--gray-300)' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--gray-500)', letterSpacing: '0.04em' }}>
                  {avgRating} ({product.reviews.length})
                </span>
              </div>
            )}

            {/* Tags */}
            {(product.gender || product.season || product.category) && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {product.gender   && <span className="badge badge-gray">{product.gender}</span>}
                {product.season   && <span className="badge badge-gray">{product.season}</span>}
                {product.category && <span className="badge badge-sand">{product.category.name}</span>}
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--gray-200)', marginBottom: '2rem' }} />

            {/* Color selector */}
            {colors.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--black)' }}>
                  Colour <span style={{ fontWeight: 400, color: 'var(--gray-500)', letterSpacing: '0.04em', textTransform: 'none' }}>— {selColor || ''}</span>
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {colors.map(c => (
                    <button
                      key={c.color}
                      title={c.color}
                      onClick={() => setSelColor(c.color)}
                      className={`color-swatch${selColor === c.color ? ' selected' : ''}`}
                      style={{
                        width: '30px', height: '30px',
                        background: c.colorHex || '#ccc',
                        border: c.colorHex === '#FFFFFF' ? '1px solid var(--gray-300)' : 'none',
                        cursor: 'pointer', padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--black)' }}>
                    Size
                  </p>
                  <button style={{
                    fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', borderBottom: '1px solid var(--gray-400)', paddingBottom: '1px',
                    transition: 'color 0.2s',
                  }}>
                    Size Guide
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {sizes.map(s => {
                    const v   = variants.find(v => v.size === s && (selColor ? v.color === selColor : true))
                    const oos = !v || v.stockQty === 0
                    return (
                      <button key={s}
                        onClick={() => !oos && setSelSize(s)}
                        className={`size-btn${selSize === s ? ' selected' : ''}${oos ? ' size-btn-oos' : ''}`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Material */}
            {selVar?.material && (
              <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: '2rem', letterSpacing: '0.03em' }}>
                {selVar.material}
              </p>
            )}

            {/* Out of stock notice */}
            {!inStock && selVar && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>This variant is currently out of stock</div>
            )}

            {/* Add to Bag */}
            <button
              onClick={addToCart}
              disabled={!inStock || !selVar}
              className="btn btn-black btn-full"
              style={{ padding: '1.15rem', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              {addMsg || (inStock ? 'Add to Bag' : 'Out of Stock')}
            </button>

            {/* Wishlist + View Bag row */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <button
                onClick={toggleWishlist}
                disabled={wishPending}
                style={{
                  background: wishlisted ? 'var(--black)' : 'none',
                  color:      wishlisted ? 'var(--white)' : 'var(--black)',
                  border:     '1px solid var(--black)',
                  cursor:     'pointer',
                  padding:    '1.1rem',
                  display:    'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s, color 0.2s',
                }}
                title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <Link href="/cart" className="btn btn-outline btn-full"
                style={{ display: 'flex', padding: '1.1rem', fontSize: '0.62rem', letterSpacing: '0.18em', flex: 1, justifyContent: 'center' }}>
                View Bag
              </Link>
            </div>

            {/* Delivery note */}
            <p style={{ fontSize: '0.65rem', color: 'var(--gray-500)', letterSpacing: '0.04em', marginBottom: '2.5rem', textAlign: 'center' }}>
              Free delivery on orders over EGP {DELIVERY_THRESHOLD} &nbsp;·&nbsp; Cash on Delivery available
            </p>

            <div style={{ height: '1px', background: 'var(--gray-200)', marginBottom: '0' }} />

            {/* Accordion sections */}
            {[
              {
                key:  'description',
                title: 'Description',
                content: product.description || null,
              },
              {
                key:  'care',
                title: 'Care Instructions',
                content: selVar?.material
                  ? `Composition: ${selVar.material}. ${product.care || 'Please follow care label.'}`
                  : product.care || null,
              },
              {
                key:  'delivery',
                title: 'Delivery & Returns',
                content: `Free delivery on orders over EGP ${DELIVERY_THRESHOLD}. Standard delivery EGP ${DELIVERY_FEE}. Free returns within 14 days of delivery. Cash on Delivery available.`,
              },
            ].filter(s => s.content).map(section => (
              <div key={section.key} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <button
                  onClick={() => setOpenSection(s => s === section.key ? null : section.key)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '1.25rem 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--black)' }}>
                    {section.title}
                  </span>
                  <span style={{ color: 'var(--gray-400)', fontSize: '1rem', fontWeight: 300, transition: 'transform 0.2s', display: 'inline-block', transform: openSection === section.key ? 'rotate(45deg)' : 'none' }}>
                    +
                  </span>
                </button>
                {openSection === section.key && (
                  <div style={{ paddingBottom: '1.25rem', animation: 'fadeUp 0.2s ease' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.85, letterSpacing: '0.01em' }}>
                      {section.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div style={{ borderTop: '1px solid var(--gray-300)', padding: '6rem 0' }}>
          <div className="section-md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                fontWeight: 300,
                letterSpacing: '0.03em',
              }}>
                Reviews {avgRating && <span style={{ fontWeight: 300, color: 'var(--gray-400)', fontSize: '70%' }}>({avgRating}/5)</span>}
              </h2>
            </div>

            {product.reviews?.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '3rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 300 }}>
                No reviews yet — be the first to write one.
              </p>
            )}

            {/* Review list */}
            {product.reviews?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '4rem' }}>
                {product.reviews.map(r => (
                  <div key={r.id} style={{ padding: '2rem 0', borderBottom: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '0.4rem' }}>
                          {[1,2,3,4,5].map(n => (
                            <div key={n} style={{ width: '8px', height: '8px', borderRadius: '50%', background: n <= r.rating ? 'var(--black)' : 'var(--gray-300)' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--black)', fontWeight: 500, letterSpacing: '0.05em' }}>
                          {r.user?.name || 'Customer'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {r.body && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.8, letterSpacing: '0.01em' }}>
                        {r.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review form */}
            {!reviewDone ? (
              <form onSubmit={submitReview} style={{ maxWidth: '480px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 300,
                  letterSpacing: '0.03em',
                  marginBottom: '2rem',
                }}>
                  Write a Review
                </h3>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label className="label" style={{ marginBottom: '1rem' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button"
                        onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                        style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          border: 'none', cursor: 'pointer',
                          background: n <= reviewForm.rating ? 'var(--black)' : 'var(--gray-200)',
                          transition: 'background 0.15s',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label className="label" style={{ marginBottom: '0.75rem' }}>Comment (optional)</label>
                  <textarea
                    className="input-line"
                    value={reviewForm.body}
                    onChange={e => setReviewForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="Tell us what you think..."
                    rows={3}
                    style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-black btn-sm">Submit Review</button>
              </form>
            ) : (
              <div className="alert alert-success">Thank you for your review.</div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div style={{ borderTop: '1px solid var(--gray-300)', padding: '6rem 0' }}>
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 300 }}>
                  You May Also Like
                </h2>
                <Link href="/products" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '2px' }}>
                  View All
                </Link>
              </div>
              <div className="product-grid">
                {related.map(p => (
                  <div key={p.id} style={{ padding: '0.5rem' }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
