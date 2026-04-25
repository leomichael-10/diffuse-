'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../../components/Navbar.js'
import ProductCard from '../../../components/ProductCard.js'
import { formatPrice, DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../../lib/format.js'

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

function sortSizes(sizes) {
  const named   = sizes.filter(s => SIZE_ORDER.includes(s)).sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
  const numeric = sizes.filter(s => !SIZE_ORDER.includes(s) && !isNaN(Number(s))).sort((a, b) => Number(a) - Number(b))
  const other   = sizes.filter(s => !SIZE_ORDER.includes(s) && isNaN(Number(s))).sort()
  return [...named, ...numeric, ...other]
}

function StockBadge({ qty }) {
  if (qty === null || qty === undefined) return null
  if (qty === 0)  return <span style={{ fontSize: '0.68rem', color: '#c62828', letterSpacing: '0.06em' }}>Out of Stock</span>
  if (qty <= 5)   return <span style={{ fontSize: '0.68rem', color: '#e65100', letterSpacing: '0.06em' }}>Low Stock — {qty} left</span>
  return <span style={{ fontSize: '0.68rem', color: '#2e7d32', letterSpacing: '0.06em' }}>In Stock</span>
}

export default function ProductPage() {
  const { id }  = useParams()
  const router  = useRouter()

  const [product,     setProduct]     = useState(null)
  const [related,     setRelated]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  // Image state
  const [mainImage,   setMainImage]   = useState(null)
  const [imgFading,   setImgFading]   = useState(false)

  // Selection state
  const [selSize,     setSelSize]     = useState(null)
  const [selColor,    setSelColor]    = useState(null)

  // UI state
  const [addMsg,      setAddMsg]      = useState('')
  const [wishlisted,  setWishlisted]  = useState(false)
  const [wishPending, setWishPending] = useState(false)
  const [reviewForm,  setReviewForm]  = useState({ rating: 5, body: '' })
  const [reviewDone,  setReviewDone]  = useState(false)
  const [openSection, setOpenSection] = useState('description')

  /* ── Fetch product ── */
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error || !d.id) { setNotFound(true); setLoading(false); return }
        setProduct(d)
        // Pre-select first in-stock variant
        const first = d.variants?.find(v => v.stockQty > 0) || d.variants?.[0]
        if (first) { setSelSize(first.size); setSelColor(first.color) }
        setLoading(false)
        if (d.categoryId) {
          fetch(`/api/products?categoryId=${d.categoryId}&limit=5`)
            .then(r => r.json())
            .then(rel => setRelated((Array.isArray(rel) ? rel : []).filter(p => p.id !== d.id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  /* ── Initialize main image from product ── */
  useEffect(() => {
    if (!product) return
    const firstVariantImg = product.variants?.find(v => v.image)?.image
    const firstProductImg = product.images?.[0]?.url
    setMainImage(firstVariantImg || firstProductImg || null)
  }, [product])

  /* ── Update main image when color changes ── */
  useEffect(() => {
    if (!product || !selColor) return
    const variantImg = product.variants?.find(v => v.color === selColor && v.image)?.image
    const fallback   = product.images?.[0]?.url || null
    fadeToImage(variantImg || fallback)
  }, [selColor]) // eslint-disable-line react-hooks/exhaustive-deps

  function fadeToImage(url) {
    if (!url || url === mainImage) return
    setImgFading(true)
    setTimeout(() => {
      setMainImage(url)
      setImgFading(false)
    }, 180)
  }

  /* ── Fetch wishlist ── */
  useEffect(() => {
    if (!id) return
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) return
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setWishlisted(d.some(i => i.productId === Number(id))) })
      .catch(() => {})
  }, [id])

  /* ── Derived state ── */
  const variants = product?.variants || []

  // Unique, sorted sizes — filtered to selected color if chosen
  const availableSizes = sortSizes([
    ...new Set(
      (selColor ? variants.filter(v => v.color === selColor) : variants)
        .map(v => v.size).filter(Boolean)
    ),
  ])

  // Unique colors — filtered to selected size if chosen, with variant image attached
  const availableColors = [
    ...new Map(
      (selSize ? variants.filter(v => v.size === selSize) : variants)
        .filter(v => v.color)
        .map(v => [v.color, { color: v.color, colorHex: v.colorHex, image: v.image }])
    ).values(),
  ]

  // Cross-reset selections when the other axis becomes unavailable
  useEffect(() => {
    if (selColor && availableColors.length > 0 && !availableColors.find(c => c.color === selColor)) {
      setSelColor(availableColors[0]?.color || null)
    }
  }, [selSize]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selSize && availableSizes.length > 0 && !availableSizes.includes(selSize)) {
      setSelSize(availableSizes[0] || null)
    }
  }, [selColor]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedVariant = variants.find(v =>
    (selSize  ? v.size  === selSize  : true) &&
    (selColor ? v.color === selColor : true)
  ) || null

  const price    = selectedVariant ? Number(selectedVariant.priceAed) : (variants[0] ? Number(variants[0].priceAed) : 0)
  const inStock  = selectedVariant ? selectedVariant.stockQty > 0 : false
  const stockQty = selectedVariant?.stockQty ?? null
  const avgRating = product?.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  // Build thumbnail list: one per unique color variant image + product images not already shown
  const productImages = product?.images || []
  const thumbnails = (() => {
    if (!product) return []
    const seen = new Set()
    const list = []
    // Color-keyed variant images first
    for (const v of variants) {
      if (v.image && !seen.has(v.image)) {
        seen.add(v.image)
        list.push({ url: v.image, color: v.color })
      }
    }
    // Product-level images that aren't already present
    for (const img of productImages) {
      if (!seen.has(img.url)) {
        seen.add(img.url)
        list.push({ url: img.url, color: null })
      }
    }
    return list
  })()

  /* ── Actions ── */
  function addToCart() {
    if (!selectedVariant || !inStock) return
    const image = mainImage || productImages[0]?.url || null
    const item  = {
      variantId: selectedVariant.id,
      productId: product.id,
      name:      product.name,
      brand:     product.brand || 'Diffuse',
      size:      selectedVariant.size,
      color:     selectedVariant.color,
      colorHex:  selectedVariant.colorHex,
      price:     Number(selectedVariant.priceAed),
      qty:       1,
      quantity:  1,
      image,
    }
    const cart = JSON.parse(localStorage.getItem('diffuse_cart') || '[]')
    const idx  = cart.findIndex(i => i.variantId === selectedVariant.id)
    if (idx >= 0) { cart[idx].qty = (cart[idx].qty || 0) + 1; cart[idx].quantity = cart[idx].qty }
    else cart.push(item)
    localStorage.setItem('diffuse_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setAddMsg('Added to Bag')
    setTimeout(() => setAddMsg(''), 2400)
  }

  async function toggleWishlist() {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login'); return }
    setWishPending(true)
    try {
      const res  = await fetch('/api/wishlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(id) }),
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, ...reviewForm }),
    })
    setReviewDone(true)
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - var(--nav-height))' }}>
            <div className="shimmer" style={{ minHeight: '500px' }} />
            <div style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ height: '11px', width: '28%' }} className="shimmer" />
              <div style={{ height: '32px', width: '72%' }} className="shimmer" />
              <div style={{ height: '22px', width: '18%', marginTop: '0.5rem' }} className="shimmer" />
              <div style={{ height: '1px', width: '100%', background: 'var(--gray-200)', marginTop: '1rem' }} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '0.75rem' }}>
                {[1,2,3].map(i => <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%' }} className="shimmer" />)}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4].map(i => <div key={i} style={{ width: '52px', height: '40px' }} className="shimmer" />)}
              </div>
              <div style={{ height: '48px', width: '100%', marginTop: '0.75rem' }} className="shimmer" />
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ── Not found ── */
  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <div className="page-body" style={{ textAlign: 'center', padding: '10rem 2rem', minHeight: 'calc(100vh - var(--nav-height))' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--gray-500)', marginBottom: '1rem' }}>
            Product not found
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            This product may have been removed or is no longer available.
          </p>
          <Link href="/products" className="btn btn-outline btn-sm">Back to Shop</Link>
        </div>
      </>
    )
  }

  const canAdd      = !!(selSize || availableSizes.length === 0) && !!(selColor || availableColors.length === 0)
  const addBtnLabel = addMsg ? addMsg : !canAdd ? 'Select size and colour' : !inStock ? 'Out of Stock' : 'Add to Bag'

  return (
    <>
      <Navbar />
      <div className="page-body">

        {/* Breadcrumb */}
        <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Home',  href: '/' },
            { label: 'Shop',  href: '/products' },
            product.category && { label: product.category.name, href: `/products?categoryId=${product.categoryId}` },
            { label: product.name, href: null },
          ].filter(Boolean).map((crumb, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {crumb.href
                ? <Link href={crumb.href} style={{ fontSize: '0.62rem', letterSpacing: '0.06em', color: 'var(--gray-500)' }}>{crumb.label}</Link>
                : <span style={{ fontSize: '0.62rem', letterSpacing: '0.06em', color: 'var(--black)' }}>{crumb.label}</span>
              }
              {i < arr.length - 1 && <span style={{ color: 'var(--gray-300)', fontSize: '0.55rem' }}>/</span>}
            </span>
          ))}
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'start' }} className="product-detail-layout">

          {/* ── LEFT — Image gallery ── */}
          <div style={{ position: 'sticky', top: 'var(--nav-height)', height: 'calc(100vh - var(--nav-height))', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', flexDirection: 'column' }}>

            {/* Main image with fade transition */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {mainImage ? (
                <Image
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover', opacity: imgFading ? 0 : 1, transition: 'opacity 0.18s ease' }}
                  sizes="50vw"
                  priority
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '6rem', fontWeight: 200, color: 'var(--gray-300)', lineHeight: 1 }}>
                    {(product.name || 'D').charAt(0)}
                  </span>
                  <span style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
                    {product.name}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {thumbnails.length > 1 && (
              <div style={{ display: 'flex', gap: '1px', height: '80px', background: 'var(--gray-300)', flexShrink: 0, overflowX: 'auto' }}>
                {thumbnails.map((thumb, i) => (
                  <button
                    key={thumb.url}
                    title={thumb.color || `Image ${i + 1}`}
                    onClick={() => {
                      // Clicking a colour thumbnail also selects that colour
                      if (thumb.color) setSelColor(thumb.color)
                      fadeToImage(thumb.url)
                    }}
                    style={{
                      position: 'relative', flexShrink: 0, width: '64px', height: '80px',
                      border: 'none', padding: 0, cursor: 'pointer', background: 'var(--gray-100)',
                      outline: mainImage === thumb.url ? '2px solid var(--black)' : '2px solid transparent',
                      outlineOffset: '-2px',
                      transition: 'outline-color 0.15s',
                    }}
                  >
                    <Image src={thumb.url} alt={thumb.color || ''} fill style={{ objectFit: 'cover' }} sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT — Product info ── */}
          <div style={{ padding: 'clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3.5rem)', overflowY: 'auto', maxHeight: 'calc(100vh - var(--nav-height))', position: 'sticky', top: 'var(--nav-height)' }}>

            {/* Brand */}
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
              {product.brand || 'Diffuse'}
            </p>

            {/* Name */}
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,2.5vw,2.1rem)', fontWeight: 300, letterSpacing: '0.03em', lineHeight: 1.25, color: 'var(--black)', marginBottom: '1rem' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: '7px', height: '7px', borderRadius: '50%', background: n <= Math.round(Number(avgRating)) ? 'var(--black)' : 'var(--gray-300)' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.63rem', color: 'var(--gray-500)', letterSpacing: '0.04em' }}>
                  {avgRating} / 5 — {product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ fontSize: '1.25rem', fontWeight: 400, letterSpacing: '0.03em', color: 'var(--black)', marginBottom: '0.625rem' }}>
              {formatPrice(price)}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.85, marginBottom: '1.25rem', letterSpacing: '0.01em' }}>
                {product.description}
              </p>
            )}

            {/* Tags */}
            {(product.gender || product.season || product.category) && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {product.gender   && <span className="badge badge-gray">{product.gender}</span>}
                {product.season   && <span className="badge badge-gray">{product.season}</span>}
                {product.category && <span className="badge badge-sand">{product.category.name}</span>}
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--gray-200)', margin: '1.5rem 0' }} />

            {/* ── Colour selector ── */}
            {availableColors.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '0.875rem', color: 'var(--black)' }}>
                  Colour
                  {selColor && (
                    <span style={{ fontWeight: 400, color: 'var(--gray-500)', letterSpacing: '0.04em', textTransform: 'none' }}> — {selColor}</span>
                  )}
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {availableColors.map(c => (
                    <button
                      key={c.color}
                      title={c.color}
                      onClick={() => setSelColor(c.color)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: c.colorHex || '#111',
                        border: c.colorHex?.toUpperCase() === '#FFFFFF' ? '1px solid var(--gray-300)' : 'none',
                        cursor: 'pointer', padding: 0, flexShrink: 0,
                        boxShadow: selColor === c.color
                          ? '0 0 0 2px var(--white), 0 0 0 3.5px var(--black)'
                          : '0 0 0 1.5px rgba(0,0,0,0.12)',
                        transition: 'box-shadow 0.15s',
                        position: 'relative',
                      }}
                    >
                      {/* Colour thumbnail overlay if variant has its own image */}
                      {c.image && (
                        <span style={{
                          position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                          display: 'block', opacity: 0.35,
                        }}>
                          <Image src={c.image} alt={c.color} fill style={{ objectFit: 'cover' }} sizes="28px" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Size selector ── */}
            {availableSizes.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '0.875rem', color: 'var(--black)' }}>
                  Size
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableSizes.map(s => {
                    const v   = variants.find(v => v.size === s && (selColor ? v.color === selColor : true))
                    const oos = !v || v.stockQty === 0
                    return (
                      <button key={s} onClick={() => !oos && setSelSize(s)} style={{
                        minWidth: '46px', height: '40px', padding: '0 0.75rem',
                        border:      selSize === s ? '1px solid var(--black)' : '1px solid var(--gray-300)',
                        background:  selSize === s ? 'var(--black)' : 'var(--white)',
                        color:       selSize === s ? 'var(--white)' : oos ? 'var(--gray-300)' : 'var(--black)',
                        cursor:      oos ? 'not-allowed' : 'pointer',
                        fontSize:    '0.72rem', letterSpacing: '0.06em', fontFamily: 'inherit',
                        textDecoration: oos ? 'line-through' : 'none',
                        transition:  'background 0.15s, color 0.15s, border-color 0.15s',
                      }}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Material */}
            {selectedVariant?.material && (
              <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                Material: {selectedVariant.material}
              </p>
            )}

            {/* Stock badge */}
            {(selSize || selColor) && selectedVariant && (
              <div style={{ marginBottom: '1.25rem' }}>
                <StockBadge qty={stockQty} />
              </div>
            )}

            {/* Add to Bag */}
            <button
              onClick={addToCart}
              disabled={!canAdd || !inStock || !!addMsg}
              className="btn btn-black btn-full"
              style={{ padding: '1.15rem', fontSize: '0.62rem', letterSpacing: '0.2em', marginBottom: '0.75rem', opacity: (!canAdd || !inStock) && !addMsg ? 0.45 : 1, cursor: (!canAdd || !inStock) ? 'default' : 'pointer' }}
            >
              {addBtnLabel}
            </button>

            {/* Wishlist + View Bag */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <button
                onClick={toggleWishlist}
                disabled={wishPending}
                title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                style={{ background: wishlisted ? 'var(--black)' : 'none', color: wishlisted ? 'var(--white)' : 'var(--black)', border: '1px solid var(--black)', cursor: 'pointer', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s, color 0.2s' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <Link href="/cart" className="btn btn-outline btn-full" style={{ display: 'flex', padding: '1rem', fontSize: '0.62rem', letterSpacing: '0.18em', flex: 1, justifyContent: 'center' }}>
                View Bag
              </Link>
            </div>

            {/* Delivery note */}
            <p style={{ fontSize: '0.62rem', color: 'var(--gray-500)', textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.7, marginBottom: '2rem' }}>
              Free delivery on orders over {formatPrice(DELIVERY_THRESHOLD)}&nbsp;·&nbsp;Cash on Delivery available
            </p>

            <div style={{ height: '1px', background: 'var(--gray-200)' }} />

            {/* Accordion */}
            {[
              {
                key:     'description',
                title:   'Product Details',
                content: [
                  product.gender  && `Gender: ${product.gender}`,
                  product.season  && `Season: ${product.season}`,
                  selectedVariant?.material && `Material: ${selectedVariant.material}`,
                  product.care    && `Care: ${product.care}`,
                  product.description,
                ].filter(Boolean).join('\n'),
              },
              {
                key:     'care',
                title:   'Care Instructions',
                content: product.care || (selectedVariant?.material ? `Made from ${selectedVariant.material}. Please follow garment care label.` : null),
              },
              {
                key:     'delivery',
                title:   'Delivery & Returns',
                content: `Free delivery on orders over ${formatPrice(DELIVERY_THRESHOLD)} within Cairo.\nStandard delivery: ${formatPrice(DELIVERY_FEE)}.\nDelivery time: 2–3 business days within Cairo, 3–5 days elsewhere in Egypt.\nReturns accepted within 14 days of delivery in original condition.`,
              },
            ].filter(s => s.content).map(section => (
              <div key={section.key} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <button
                  onClick={() => setOpenSection(s => s === section.key ? null : section.key)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1.2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--black)' }}>{section.title}</span>
                  <span style={{ color: 'var(--gray-400)', fontSize: '1rem', fontWeight: 300, transition: 'transform 0.2s', display: 'inline-block', transform: openSection === section.key ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
                </button>
                {openSection === section.key && (
                  <div style={{ paddingBottom: '1.2rem' }}>
                    {section.content.split('\n').map((line, i) => (
                      <p key={i} style={{ fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.85, letterSpacing: '0.01em' }}>{line}</p>
                    ))}
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
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem,2.5vw,2rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
                Customer Reviews{avgRating && <span style={{ fontWeight: 300, color: 'var(--gray-400)', fontSize: '60%', marginLeft: '0.75rem' }}>{avgRating} / 5</span>}
              </h2>
            </div>

            {product.reviews?.length === 0 && (
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 300, color: 'var(--gray-500)', marginBottom: '3rem', fontStyle: 'italic' }}>
                No reviews yet — be the first to share your thoughts.
              </p>
            )}

            {product.reviews?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '4rem' }}>
                {product.reviews.map(r => (
                  <div key={r.id} style={{ padding: '2rem 0', borderBottom: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '0.4rem' }}>
                          {[1,2,3,4,5].map(n => <div key={n} style={{ width: '8px', height: '8px', borderRadius: '50%', background: n <= r.rating ? 'var(--black)' : 'var(--gray-300)' }} />)}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--black)', fontWeight: 500, letterSpacing: '0.05em' }}>{r.user?.name || 'Customer'}</span>
                      </div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {r.body && <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.8, letterSpacing: '0.01em' }}>{r.body}</p>}
                  </div>
                ))}
              </div>
            )}

            {!reviewDone ? (
              <form onSubmit={submitReview} style={{ maxWidth: '480px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 300, letterSpacing: '0.03em', marginBottom: '2rem' }}>Write a Review</h3>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label className="label" style={{ marginBottom: '1rem' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: n <= reviewForm.rating ? 'var(--black)' : 'var(--gray-200)', transition: 'background 0.15s' }} />
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label className="label" style={{ marginBottom: '0.75rem' }}>Comment (optional)</label>
                  <textarea className="input-line" value={reviewForm.body} onChange={e => setReviewForm(p => ({ ...p, body: e.target.value }))} placeholder="Tell us what you think..." rows={3} style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }} />
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
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem,2.5vw,2rem)', fontWeight: 300, letterSpacing: '0.03em' }}>You May Also Like</h2>
                <Link href="/products" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '2px' }}>View All</Link>
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

      <style>{`
        @media (max-width: 768px) {
          .product-detail-layout { grid-template-columns: 1fr !important; }
          .product-detail-layout > div:first-child { position: relative !important; top: 0 !important; height: 80vw !important; max-height: 480px; }
          .product-detail-layout > div:last-child  { position: relative !important; top: 0 !important; max-height: none !important; }
        }
      `}</style>
    </>
  )
}
