'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar.js'
import ProductCard from '../../components/ProductCard.js'

const GENDERS  = ['Men', 'Women', 'Unisex', 'Kids']
const SIZES    = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', 'One Size']
const SORT_OPT = [
  { value: 'new',        label: 'New In' },
  { value: 'price-low',  label: 'Price: Low — High' },
  { value: 'price-high', label: 'Price: High — Low' },
  { value: 'name-asc',   label: 'Name A — Z' },
]

function ShopInner() {
  const searchParams = useSearchParams()
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState(searchParams.get('search') || '')
  const [catId,       setCatId]       = useState(searchParams.get('categoryId') || '')
  const [gender,      setGender]      = useState(searchParams.get('gender') || '')
  const [size,        setSize]        = useState('')
  const [minPrice,    setMinPrice]    = useState('')
  const [maxPrice,    setMaxPrice]    = useState('')
  const [sortBy,      setSortBy]      = useState('new')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search)   p.set('search', search)
    if (catId)    p.set('categoryId', catId)
    if (gender)   p.set('gender', gender)
    if (minPrice) p.set('minPrice', minPrice)
    if (maxPrice) p.set('maxPrice', maxPrice)
    p.set('limit', '80')

    fetch(`/api/products?${p}`)
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, catId, gender, minPrice, maxPrice])

  function clearFilters() {
    setSearch(''); setCatId(''); setGender(''); setSize('')
    setMinPrice(''); setMaxPrice('')
  }

  let displayed = [...products]
  if (size) displayed = displayed.filter(p => p.variants?.some(v => v.size === size && v.stockQty > 0))
  if (sortBy === 'price-low')  displayed.sort((a, b) => Math.min(...a.variants.map(v => Number(v.priceAed))) - Math.min(...b.variants.map(v => Number(v.priceAed))))
  if (sortBy === 'price-high') displayed.sort((a, b) => Math.min(...b.variants.map(v => Number(v.priceAed))) - Math.min(...a.variants.map(v => Number(v.priceAed))))
  if (sortBy === 'name-asc')   displayed.sort((a, b) => a.name.localeCompare(b.name))

  const allCats   = categories.flatMap(c => [c, ...(c.children || [])])
  const hasFilter = search || catId || gender || size || minPrice || maxPrice

  const filterPanelContent = (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '2.5rem' }}>
        <label className="label" style={{ marginBottom: '0.75rem' }}>Search</label>
        <input
          type="text"
          className="input-line"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: '0.9rem' }}
        />
      </div>

      <FilterGroup title="Category">
        <FilterBtn active={catId === ''} onClick={() => setCatId('')}>All</FilterBtn>
        {allCats.map(c => (
          <FilterBtn key={c.id} active={catId === String(c.id)} onClick={() => setCatId(String(c.id))}>
            {c.parentId ? <><span style={{ color: 'var(--gray-400)', marginRight: '4px' }}>—</span>{c.name}</> : c.name}
          </FilterBtn>
        ))}
      </FilterGroup>

      <FilterGroup title="Gender">
        <FilterBtn active={gender === ''} onClick={() => setGender('')}>All</FilterBtn>
        {GENDERS.map(g => (
          <FilterBtn key={g} active={gender === g} onClick={() => setGender(g)}>{g}</FilterBtn>
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {SIZES.map(s => (
            <button key={s}
              onClick={() => setSize(size === s ? '' : s)}
              className={`size-btn${size === s ? ' selected' : ''}`}
              style={{ width: '40px', height: '40px', fontSize: '0.6rem' }}>
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price (EGP)">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input type="number" className="input-line" placeholder="Min" value={minPrice}
            onChange={e => setMinPrice(e.target.value)} style={{ fontSize: '0.9rem' }} />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem', flexShrink: 0 }}>—</span>
          <input type="number" className="input-line" placeholder="Max" value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)} style={{ fontSize: '0.9rem' }} />
        </div>
      </FilterGroup>

      {hasFilter && (
        <button onClick={() => { clearFilters(); setMobileFiltersOpen(false) }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--gray-500)', fontFamily: 'inherit', padding: 0,
          borderBottom: '1px solid var(--gray-400)', paddingBottom: '1px',
        }}>
          Clear All
        </button>
      )}
    </div>
  )

  return (
    <div className="shop-layout">

      {/* ── Desktop sidebar ── */}
      <aside className="shop-sidebar">
        {filterPanelContent}
      </aside>

      {/* ── Mobile filter drawer ── */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div className="mobile-filter-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--gray-500)', lineHeight: 1, padding: '0 0.25rem' }}>×</button>
            </div>
            {filterPanelContent}
            <button onClick={() => setMobileFiltersOpen(false)} className="btn btn-black btn-full btn-sm" style={{ marginTop: '2rem' }}>
              View {displayed.length} Items
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{
          borderBottom: '1px solid var(--gray-300)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--white)',
          position: 'sticky',
          top: 'var(--nav-height)',
          zIndex: 50,
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile filter button */}
            <button
              className="mobile-filter-btn"
              onClick={() => setMobileFiltersOpen(true)}
              style={{
                background: 'none', border: '1px solid var(--gray-300)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '0.5rem 0.875rem', color: 'var(--black)',
                display: 'none', alignItems: 'center', gap: '0.4rem',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filter{hasFilter ? ` (${[search,catId,gender,size,minPrice,maxPrice].filter(Boolean).length})` : ''}
            </button>

            <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              {loading ? '' : `${displayed.length} Item${displayed.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              fontSize: '0.65rem', letterSpacing: '0.06em',
              border: 'none', borderBottom: '1px solid var(--gray-300)',
              background: 'transparent', padding: '0.2rem 1.5rem 0.2rem 0',
              cursor: 'pointer', fontFamily: 'inherit', color: 'var(--black)',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center',
              outline: 'none',
            }}>
            {SORT_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="product-grid-3">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} style={{ padding: '1rem' }}>
                <div style={{ aspectRatio: '3/4' }} className="shimmer" />
                <div style={{ padding: '0.875rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ height: '11px', width: '60%' }} className="shimmer" />
                  <div style={{ height: '11px', width: '25%' }} className="shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gray-500)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, marginBottom: '1rem' }}>
              No products found
            </p>
            {hasFilter && (
              <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid-3">
            {displayed.map(p => (
              <div key={p.id} style={{ padding: '0.75rem' }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: '2rem' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '0 0 0.75rem',
        borderBottom: '1px solid var(--gray-200)',
        marginBottom: open ? '0.875rem' : 0,
        fontFamily: 'inherit',
      }}>
        <span style={{ fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--black)' }}>
          {title}
        </span>
        <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem', display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(-90deg)' }}>
          ›
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: '0',
      fontSize: '0.82rem',
      color: active ? 'var(--black)' : 'var(--gray-500)',
      fontWeight: active ? 500 : 400,
      cursor: 'pointer', textAlign: 'left',
      fontFamily: 'inherit', letterSpacing: '0.01em',
      transition: 'color 0.15s',
    }}>
      {children}
    </button>
  )
}

export default function ProductsPage() {
  const genderParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('gender') : ''

  return (
    <>
      <Navbar />
      <div className="page-body">
        {/* Page header */}
        <div style={{
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)',
          borderBottom: '1px solid var(--gray-300)',
          background: 'var(--white)',
        }}>
          <p className="t-label" style={{ marginBottom: '0.75rem' }}>Diffuse Collection</p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: 'var(--black)',
          }}>
            {genderParam || 'Shop All'}
          </h1>
        </div>

        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '8rem', color: 'var(--gray-500)', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Loading
          </div>
        }>
          <ShopInner />
        </Suspense>
      </div>
    </>
  )
}
