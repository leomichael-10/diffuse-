'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar.js'

const STATUS_COLORS = {
  pending:    'badge-yellow',
  confirmed:  'badge-blue',
  processing: 'badge-blue',
  shipped:    'badge-blue',
  delivered:  'badge-green',
  cancelled:  'badge-red',
}

export default function SellerDashboard() {
  const router = useRouter()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'seller') { router.push('/login'); return }
    fetch('/api/seller/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: '6rem', color: '#64748B' }}>Loading dashboard...</div></>
  if (!data) return <><Navbar /><div style={{ textAlign: 'center', padding: '6rem', color: '#64748B' }}>Could not load dashboard.</div></>

  const { seller, stats, recentProducts } = data

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="heading-lg">{seller.businessName}</h1>
            <p style={{ color: '#64748B', marginTop: '0.25rem' }}>{seller.city}{seller.area ? `, ${seller.area}` : ''}</p>
          </div>
          <Link href="/dashboard/products/add" className="btn btn-primary">+ Add Product</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Active Products', value: stats.productCount, color: '#3B82F6' },
            { label: 'Total Orders', value: stats.orderCount, color: '#10B981' },
            { label: 'Pending Orders', value: stats.pendingOrders, color: '#F59E0B' },
            { label: 'Revenue (EGP)', value: stats.totalRevenue.toLocaleString('en-EG'), color: '#0F172A' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, marginBottom: '0.25rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { href: '/dashboard/products', title: 'Manage Products', desc: 'View, edit, and delete your products' },
            { href: '/dashboard/orders',   title: 'View Orders',     desc: 'Manage and update order statuses' },
            { href: '/dashboard/products/add', title: 'Add New Product', desc: 'List a new clothing item' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{l.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{l.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent products */}
        {recentProducts?.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="heading-md">Recent Products</h2>
              <Link href="/dashboard/products" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Variants</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        {p.brand && <div style={{ fontSize: '0.775rem', color: '#64748B' }}>{p.brand}</div>}
                      </td>
                      <td style={{ color: '#64748B', fontSize: '0.875rem' }}>{p.category?.name || '—'}</td>
                      <td style={{ color: '#64748B', fontSize: '0.875rem' }}>{p.variants?.length || 0} variants</td>
                      <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <Link href={`/products/${p.id}`} className="btn btn-ghost btn-sm" style={{ marginRight: '0.5rem' }}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
