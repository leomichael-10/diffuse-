'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar.js'
import ShopCard from '../../components/ShopCard.js'

export default function ShopsPage() {
  const [shops,   setShops]   = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shops')
      .then(r => r.json())
      .then(d => { setShops(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = shops.filter(s =>
    !search || s.businessName.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Clothing Shops</h1>
          <p style={{ color: '#64748B' }}>Browse all approved sellers on Diffuse</p>
        </div>

        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
          <input type="text" className="input" placeholder="Search shops or cities..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Loading shops...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
            {search ? 'No shops match your search.' : 'No shops available yet.'}
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>{filtered.length} shop{filtered.length !== 1 ? 's' : ''}</p>
            <div className="shop-grid">
              {filtered.map(shop => <ShopCard key={shop.id} seller={shop} />)}
            </div>
          </>
        )}
      </main>
    </>
  )
}
