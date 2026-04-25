'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar.js'

const STATUSES = ['confirmed','processing','shipped','delivered','cancelled']
const STATUS_COLORS = { pending:'badge-yellow', confirmed:'badge-blue', processing:'badge-blue', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red' }

export default function SellerOrdersPage() {
  const router = useRouter()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'seller') { router.push('/login'); return }
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  async function updateStatus(id, status) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 className="heading-lg" style={{ marginBottom: '2rem' }}>Orders</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>No orders yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(order.createdAt).toLocaleDateString()} · {order.user?.name || order.user?.email}
                      {order.user?.phone && ` · ${order.user.phone}`}
                    </div>
                    {order.deliveryAddress && <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>To: {order.deliveryAddress}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>{order.status}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>EGP {Number(order.totalAed).toLocaleString('en-EG')}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.875rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {order.items?.filter(i => i.variant?.product).map(item => (
                    <div key={item.id} style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{item.variant.product.name}</span>
                      {item.variant.size  && <span>· {item.variant.size}</span>}
                      {item.variant.color && <span>· {item.variant.color}</span>}
                      <span>× {item.quantity}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600 }}>EGP {Number(item.priceAed).toLocaleString('en-EG')}</span>
                    </div>
                  ))}
                </div>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', alignSelf: 'center' }}>Update status:</span>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => updateStatus(order.id, s)}
                        disabled={order.status === s || updating === order.id}
                        className={`btn btn-sm ${order.status === s ? 'btn-navy' : 'btn-ghost'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
