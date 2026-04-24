'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '../../../components/Navbar.js'
import ProductCard from '../../../components/ProductCard.js'

const SIZES = ['XS','S','M','L','XL','XXL']
const GENDERS = ['Men','Women','Unisex','Kids']

export default function ShopPage() {
  const { id } = useParams()
  const [shop,    setShop]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filterSize,   setFilterSize]   = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [sortBy, setSortBy]  = useState('newest')

  useEffect(() => {
    fetch(`/api/shops/${id}`)
      .then(r => r.json())
      .then(d => { setShop(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: '6rem', color: '#64748B' }}>Loading...</div></>
  if (!shop?.id) return <><Navbar /><div style={{ textAlign: 'center', padding: '6rem', color: '#64748B' }}>Shop not found.</div></>

  let products = shop.products || []

  if (search) products = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  )
  if (filterGender) products = products.filter(p => p.gender === filterGender)
  if (filterSize)   products = products.filter(p => p.variants?.some(v => v.size === filterSize))

  if (sortBy === 'name-asc')    products = [...products].sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy === 'name-desc')   products = [...products].sort((a, b) => b.name.localeCompare(a.name))
  if (sortBy === 'price-low')   products = [...products].sort((a, b) => Math.min(...a.variants.map(v => Number(v.priceAed))) - Math.min(...b.variants.map(v => Number(v.priceAed))))
  if (sortBy === 'price-high')  products = [...products].sort((a, b) => Math.min(...b.variants.map(v => Number(v.priceAed))) - Math.min(...a.variants.map(v => Number(v.priceAed))))

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Shop header */}
        <div style={{ background: '#0F172A', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
            {shop.businessName.slice(0,2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{shop.businessName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              {shop.city}{shop.area ? `, ${shop.area}` : ''}
              {shop.workingHours ? ` · ${shop.workingHours}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{shop._count?.products || 0} products</span>
            {shop.deliveryAvailable && <span className="badge badge-green">Delivery Available</span>}
            {shop.rating > 0 && <span className="badge badge-navy" style={{ color: '#fff' }}>{shop.rating.toFixed(1)} rating</span>}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          <input type="text" className="input" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: '240px' }} />

          <select className="input" value={filterGender} onChange={e => setFilterGender(e.target.value)} style={{ maxWidth: '140px' }}>
            <option value="">All Genders</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select className="input" value={filterSize} onChange={e => setFilterSize(e.target.value)} style={{ maxWidth: '120px' }}>
            <option value="">All Sizes</option>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: '180px' }}>
            <option value="newest">Newest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
          </select>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>{products.length} product{products.length !== 1 ? 's' : ''}</p>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>No products match your filters.</div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={{ ...p, seller: { id: shop.id, businessName: shop.businessName } }} />)}
          </div>
        )}
      </main>
    </>
  )
}
