'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar.js'
import { formatPrice } from '../../lib/format.js'

const STATUS_LABEL = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
}

const STATUS_COLOR = {
  pending:    '#C9A96E',
  confirmed:  '#3B82F6',
  processing: '#3B82F6',
  shipped:    '#059669',
  delivered:  '#059669',
  cancelled:  '#EF4444',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login?redirect=/orders'); return }
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="page-body">

        {/* Header */}
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2.5rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Account</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              My Orders
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 3rem)', maxWidth: '900px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--gray-300)' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: 'var(--white)', padding: '1.75rem 2rem', display: 'flex', gap: '2rem' }}>
                  <div style={{ height: '12px', width: '80px' }} className="shimmer" />
                  <div style={{ height: '12px', width: '120px' }} className="shimmer" />
                  <div style={{ height: '12px', width: '60px', marginLeft: 'auto' }} className="shimmer" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--gray-400)', marginBottom: '2rem' }}>
                No orders yet
              </p>
              <Link href="/products" className="btn btn-black btn-sm">Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--gray-300)' }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: 'var(--white)' }}>
                  {/* Row header */}
                  <button
                    onClick={() => setOpen(open === order.id ? null : order.id)}
                    style={{
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '1.75rem 2rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '0.35rem' }}>
                        Order #{order.id}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--black)', letterSpacing: '0.01em' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 400, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                      {formatPrice(order.totalAed)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[order.status] || 'var(--gray-400)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: STATUS_COLOR[order.status] || 'var(--gray-500)' }}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {open === order.id && (
                    <div style={{ borderTop: '1px solid var(--gray-200)', padding: '2rem', animation: 'fadeUp 0.2s ease' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2rem' }}>
                        {order.items?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--black)' }}>
                              <span style={{ fontWeight: 400 }}>{item.variant?.product?.name || 'Product'}</span>
                              {item.variant?.size  && <span style={{ color: 'var(--gray-500)', marginLeft: '0.75rem', fontSize: '0.72rem' }}>Size {item.variant.size}</span>}
                              {item.variant?.color && <span style={{ color: 'var(--gray-500)', marginLeft: '0.5rem', fontSize: '0.72rem' }}>{item.variant.color}</span>}
                              <span style={{ color: 'var(--gray-400)', marginLeft: '0.75rem', fontSize: '0.72rem' }}>× {item.quantity ?? item.qty ?? 1}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--black)' }}>
                              {formatPrice(Number(item.priceAed) * (item.quantity ?? item.qty ?? 1))}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="orders-detail-grid" style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                          <p className="t-label" style={{ marginBottom: '0.5rem' }}>Delivery Address</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>{order.deliveryAddress || '—'}</p>
                        </div>
                        <div>
                          <p className="t-label" style={{ marginBottom: '0.5rem' }}>Payment</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                            {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod || '—'}
                          </p>
                        </div>
                      </div>
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
                        <Link href={`/orders/${order.id}`} style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '1px' }}>
                          View Full Details →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
