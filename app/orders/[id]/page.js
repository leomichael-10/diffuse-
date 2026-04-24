'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '../../../components/Navbar.js'
import { formatPrice } from '../../../lib/format.js'

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

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const router  = useRouter()
  const params  = useParams()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login?redirect=/orders'); return }

    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setOrder(d)
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [params.id])

  const stepIdx     = order ? STEPS.indexOf(order.status) : -1
  const isCancelled = order?.status === 'cancelled'

  return (
    <>
      <Navbar />
      <div className="page-body">
        {/* Header */}
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>
              <Link href="/orders" style={{ color: 'var(--gray-400)' }}>My Orders</Link>
              {' '}/ Order #{params.id}
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              Order #{params.id}
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 3rem)', maxWidth: '900px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: '60px' }} className="shimmer" />)}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 300, color: 'var(--gray-400)', marginBottom: '2rem' }}>{error}</p>
              <Link href="/orders" className="btn btn-outline btn-sm">Back to Orders</Link>
            </div>
          ) : order && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

              {/* Status tracker */}
              {!isCancelled && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', padding: '2rem' }}>
                  <p className="t-label" style={{ marginBottom: '1.5rem' }}>Order Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {STEPS.map((step, i) => {
                      const done    = stepIdx >= i
                      const current = stepIdx === i
                      return (
                        <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                          {i < STEPS.length - 1 && (
                            <div style={{ position: 'absolute', top: '9px', left: '50%', right: '-50%', height: '1px', background: done && stepIdx > i ? 'var(--black)' : 'var(--gray-200)', zIndex: 0 }} />
                          )}
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', border: `1px solid ${done ? 'var(--black)' : 'var(--gray-300)'}`,
                            background: done ? 'var(--black)' : 'var(--white)', zIndex: 1, flexShrink: 0,
                            boxShadow: current ? '0 0 0 3px rgba(0,0,0,0.08)' : 'none',
                          }} />
                          <span style={{ fontSize: '0.52rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: done ? 'var(--black)' : 'var(--gray-400)', fontWeight: current ? 500 : 400, textAlign: 'center' }}>
                            {STATUS_LABEL[step]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#B91C1C', fontSize: '0.78rem' }}>This order has been cancelled.</span>
                </div>
              )}

              {/* Items */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                  <p className="t-label">Items Ordered</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: i < order.items.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--black)' }}>
                          {item.variant?.product?.name || 'Product'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                          {[item.variant?.size && `Size ${item.variant.size}`, item.variant?.color].filter(Boolean).join(' · ')}
                          {' '}× {item.quantity ?? 1}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                        {formatPrice(Number(item.priceAed) * (item.quantity ?? 1))}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                    <span>Subtotal</span>
                    <span>{formatPrice(Number(order.totalAed) - Number(order.deliveryFeeAed))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                    <span>Delivery</span>
                    <span>{Number(order.deliveryFeeAed) === 0 ? <span style={{ color: '#C9A96E' }}>Free</span> : formatPrice(order.deliveryFeeAed)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500, paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)' }}>
                    <span>Total</span>
                    <span>{formatPrice(order.totalAed)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery + Payment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', padding: '1.5rem' }}>
                  <p className="t-label" style={{ marginBottom: '0.75rem' }}>Delivery Address</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.8 }}>{order.deliveryAddress || '—'}</p>
                </div>
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', padding: '1.5rem' }}>
                  <p className="t-label" style={{ marginBottom: '0.75rem' }}>Payment</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                    {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod || '—'}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--gray-400)', marginTop: '0.4rem' }}>
                    Placed {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/orders" className="btn btn-outline btn-sm">Back to Orders</Link>
                <Link href="/products" className="btn btn-black btn-sm">Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
