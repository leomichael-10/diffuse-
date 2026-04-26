'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar.js'

export default function SellerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'seller') { router.push('/login'); return }
    fetch('/api/seller/products')
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  async function toggleActive(id, current) {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p))
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="heading-lg">My Products</h1>
          <Link href="/dashboard/products/add" className="btn btn-primary">+ Add Product</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
            <p style={{ marginBottom: '1rem' }}>No products yet.</p>
            <Link href="/dashboard/products/add" className="btn btn-primary">Add Your First Product</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Variants</th>
                  <th>Min Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const minPrice = p.variants?.length ? Math.min(...p.variants.map(v => Number(v.priceAed))) : 0
                  const totalStock = p.variants?.reduce((s, v) => s + v.stockQty, 0) || 0
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {(p.images?.[0]?.url || p.variants?.find(v => v.image)?.image) ? (
                            <img src={p.images?.[0]?.url || p.variants?.find(v => v.image)?.image} alt="" style={{ width: '44px', height: '55px', objectFit: 'cover', borderRadius: '6px' }} />
                          ) : (
                            <div style={{ width: '44px', height: '55px', borderRadius: '6px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                              {p.name.slice(0,2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            {p.brand && <div style={{ fontSize: '0.775rem', color: '#64748B' }}>{p.brand}</div>}
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{totalStock} in stock</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: '#64748B' }}>{p.category?.name || '—'}</td>
                      <td style={{ fontSize: '0.875rem', color: '#64748B' }}>{p.variants?.length || 0}</td>
                      <td style={{ fontWeight: 600 }}>EGP {minPrice.toLocaleString('en-EG')}</td>
                      <td>
                        <button onClick={() => toggleActive(p.id, p.isActive)} className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer', border: 'none' }}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href={`/products/${p.id}`} className="btn btn-ghost btn-sm">View</Link>
                          <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id}
                            className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none' }}>
                            {deleting === p.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
