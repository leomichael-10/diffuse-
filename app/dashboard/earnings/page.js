'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar.js'

export default function EarningsPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'seller') { router.push('/login'); return }
    fetch('/api/seller/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: '6rem', color: '#64748B' }}>Loading...</div></>

  const stats = data?.stats || {}

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 className="heading-lg" style={{ marginBottom: '2rem' }}>Earnings</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Revenue', value: `EGP ${Number(stats.totalRevenue || 0).toLocaleString('en-EG')}`, desc: 'Completed orders' },
            { label: 'Total Orders', value: stats.orderCount || 0, desc: 'All time' },
            { label: 'Pending Orders', value: stats.pendingOrders || 0, desc: 'Awaiting confirmation' },
            { label: 'Active Products', value: stats.productCount || 0, desc: 'Listed items' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>{s.value}</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.775rem', color: '#64748B' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>Subscription</h2>
          <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
            Your subscription is EGP 199/month. Contact support at micheal.fadi@gmail.com for billing inquiries.
          </div>
        </div>
      </main>
    </>
  )
}
