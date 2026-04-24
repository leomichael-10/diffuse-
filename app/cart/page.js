'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar.js'
import toast from 'react-hot-toast'
import { formatPrice, EGYPT_CITIES, DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../lib/format.js'

const PAYMENT_METHODS = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery',  sub: 'Pay when your order arrives',       disabled: false },
  { id: 'mobile_wallet',    label: 'Mobile Wallet',      sub: 'Instapay or Vodafone Cash',          disabled: false },
  { id: 'card',             label: 'Card Payment',       sub: 'Coming soon — Visa / Mastercard',    disabled: true  },
]

export default function CartPage() {
  const router = useRouter()
  const [items,   setItems]   = useState([])
  const [step,    setStep]    = useState('cart')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', district: '', city: 'Cairo', notes: '',
  })
  const [payMethod, setPayMethod] = useState('cash_on_delivery')
  const [promoInput,  setPromoInput]  = useState('')
  const [promo,       setPromo]       = useState(null)  // { code, discount, discountType, discountValue }
  const [promoError,  setPromoError]  = useState('')
  const [promoLoading,setPromoLoading]= useState(false)

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('diffuse_cart') || '[]')) }
    catch { setItems([]) }
  }, [])

  function saveCart(next) {
    setItems(next)
    localStorage.setItem('diffuse_cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  function updateQty(idx, delta) {
    const newQty = Math.max(1, (items[idx].qty || items[idx].quantity || 1) + delta)
    saveCart(items.map((it, i) => i === idx ? { ...it, qty: newQty, quantity: newQty } : it))
  }

  function remove(idx) {
    saveCart(items.filter((_, i) => i !== idx))
    toast.success('Removed from bag')
  }

  const subtotal    = items.reduce((s, it) => s + it.price * (it.qty || it.quantity || 1), 0)
  const discount    = promo?.discount || 0
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : (items.length > 0 ? DELIVERY_FEE : 0)
  const vat         = Math.round(subtotal * 0.14)
  const total       = Math.max(0, subtotal - discount) + deliveryFee

  async function applyPromo() {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), orderTotal: subtotal }),
      })
      const data = await res.json()
      if (!res.ok) { setPromoError(data.error || 'Invalid code'); return }
      setPromo(data)
      toast.success(`Promo applied — ${data.discountType === 'percent' ? data.discountValue + '% off' : formatPrice(data.discountValue) + ' off'}`)
    } catch {
      setPromoError('Could not validate promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  async function proceedToCheckout() {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user) { router.push('/login?redirect=/cart'); return }
    setStep('checkout')
  }

  async function placeOrder() {
    if (!address.fullName?.trim() || !address.phone?.trim() || !address.street?.trim() || !address.city) {
      toast.error('Please fill in all delivery fields')
      return
    }
    setLoading(true)
    try {
      const deliveryAddress = `${address.fullName}, ${address.street}${address.district ? ', ' + address.district : ''}, ${address.city}, Egypt`
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(it => ({ variantId: it.variantId, quantity: it.qty || it.quantity || 1, priceAed: it.price })),
          deliveryAddress,
          paymentMethod: payMethod,
          notes: address.notes || null,
          promoCode: promo?.code || null,
          discountAed: promo?.discount || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Order failed'); return }

      setOrderId(data.id)

      if (payMethod === 'card') {
        // Initiate Paymob payment
        const nameParts = address.fullName.trim().split(' ')
        const payRes = await fetch('/api/payment/create', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId:   data.id,
            amountEgp: total,
            items:     items.map(it => ({ name: it.name, priceAed: it.price, quantity: it.qty || it.quantity || 1 })),
            customer: {
              firstName: nameParts[0] || 'Customer',
              lastName:  nameParts.slice(1).join(' ') || 'Name',
              email:     JSON.parse(localStorage.getItem('diffuse_user') || '{}').email || '',
              phone:     address.phone,
              street:    address.street,
              city:      address.city,
            },
          }),
        })
        const payData = await payRes.json()
        if (payData.paymentUrl) {
          saveCart([])
          window.location.href = payData.paymentUrl
          return
        }
        toast.error('Payment initiation failed. Try Cash on Delivery.')
        return
      }

      saveCart([])
      setStep('success')
      toast.success('Order placed successfully')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success ── */
  if (step === 'success') {
    return (
      <>
        <Navbar />
        <div className="page-body" style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ width: '52px', height: '52px', border: '1px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 300 }}>
              ✓
            </div>
            <p className="t-label" style={{ marginBottom: '1rem' }}>Thank you</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, letterSpacing: '0.03em', marginBottom: '1.5rem' }}>
              Order Confirmed
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: 1.9, marginBottom: '0.75rem' }}>
              We will contact you within 24 hours to arrange delivery.
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: '3rem' }}>
              Delivery: 2-3 business days in Cairo, 3-5 days elsewhere in Egypt.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/orders" className="btn btn-black btn-sm">View Orders</Link>
              <Link href="/products" className="btn btn-outline btn-sm">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ── Empty ── */
  if (items.length === 0 && step === 'cart') {
    return (
      <>
        <Navbar />
        <div className="page-body" style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <p className="t-label" style={{ marginBottom: '1rem' }}>Shopping Bag</p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--gray-400)', marginBottom: '2.5rem' }}>
            Your bag is empty
          </p>
          <Link href="/products" className="btn btn-black btn-sm">Start Shopping</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="page-body">
        <div style={{ padding: 'clamp(2rem,4vw,3.5rem) clamp(1.25rem,4vw,3rem) clamp(1.25rem,3vw,2rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>
              {step === 'cart' ? 'Shopping Bag' : 'Checkout'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.5rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              {step === 'cart' ? `Bag (${items.length})` : 'Delivery & Payment'}
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(1.5rem,4vw,3rem) clamp(1.25rem,4vw,3rem)' }}>
          <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>

            {/* Left — items or address */}
            <div>
              {step === 'cart' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--gray-300)' }}>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ background: 'var(--white)', padding: '1.25rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      {/* Image */}
                      <div style={{ width: '80px', height: '100px', flexShrink: 0, background: 'var(--gray-100)', position: 'relative', overflow: 'hidden' }}>
                        {it.image && <Image src={it.image} alt={it.name} fill style={{ objectFit: 'cover' }} sizes="80px" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{it.name}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {formatPrice(it.price * (it.qty || it.quantity || 1))}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: '0.875rem' }}>
                          {[it.size && `Size ${it.size}`, it.color].filter(Boolean).join(' · ')}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button onClick={() => updateQty(idx, -1)} style={{ background: 'none', border: '1px solid var(--gray-300)', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                            <span style={{ fontSize: '0.78rem', minWidth: '16px', textAlign: 'center' }}>{it.qty || it.quantity || 1}</span>
                            <button onClick={() => updateQty(idx, 1)} style={{ background: 'none', border: '1px solid var(--gray-300)', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          </div>
                          <button onClick={() => remove(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)', fontFamily: 'inherit' }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Checkout form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Delivery */}
                  <div>
                    <p className="t-label" style={{ marginBottom: '1.25rem' }}>Delivery Details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label className="label">Full Name</label>
                        <input className="input-line" value={address.fullName}
                          onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))}
                          placeholder="As on national ID" style={{ fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label className="label">Phone Number</label>
                        <input className="input-line" value={address.phone}
                          onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                          placeholder="+20 1XX XXX XXXX" type="tel" style={{ fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label className="label">Street Address</label>
                        <input className="input-line" value={address.street}
                          onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
                          placeholder="Building, Street" style={{ fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label className="label">District / Area (optional)</label>
                        <input className="input-line" value={address.district}
                          onChange={e => setAddress(a => ({ ...a, district: e.target.value }))}
                          placeholder="e.g. Maadi, Zamalek" style={{ fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label className="label">City</label>
                        <select className="input-line" value={address.city}
                          onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                          style={{ fontSize: '1rem', cursor: 'pointer' }}>
                          {EGYPT_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Special Instructions (optional)</label>
                        <input className="input-line" value={address.notes}
                          onChange={e => setAddress(a => ({ ...a, notes: e.target.value }))}
                          placeholder="Floor, landmark, etc." style={{ fontSize: '1rem' }} />
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="t-label" style={{ marginBottom: '1.25rem' }}>Payment Method</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--gray-300)' }}>
                      {PAYMENT_METHODS.map(pm => (
                        <label key={pm.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            background: pm.disabled ? 'var(--gray-100)' : payMethod === pm.id ? 'var(--gray-100)' : 'var(--white)',
                            padding: '1rem 1.25rem',
                            cursor: pm.disabled ? 'not-allowed' : 'pointer',
                            opacity: pm.disabled ? 0.5 : 1,
                          }}>
                          <input type="radio" name="payMethod" value={pm.id}
                            checked={payMethod === pm.id}
                            disabled={pm.disabled}
                            onChange={() => !pm.disabled && setPayMethod(pm.id)}
                            style={{ accentColor: '#111' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.15rem', color: pm.disabled ? 'var(--gray-400)' : 'var(--black)' }}>
                              {pm.label}
                              {pm.disabled && (
                                <span style={{ marginLeft: '0.6rem', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 400 }}>
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>{pm.sub}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-500)', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>
                    Back to Bag
                  </button>
                </div>
              )}
            </div>

            {/* Right — summary */}
            <div className="cart-summary-sticky" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
              <div style={{ border: '1px solid var(--gray-200)', padding: '1.75rem' }}>
                <p className="t-label" style={{ marginBottom: '1.5rem' }}>Order Summary</p>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--gray-600)' }}>{it.name} × {it.qty || it.quantity || 1}</span>
                      <span>{formatPrice(it.price * (it.qty || it.quantity || 1))}</span>
                    </div>
                  ))}
                </div>

                {/* Promo code */}
                <div style={{ marginBottom: '1rem' }}>
                  {promo ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#f0faf0', border: '1px solid #c6eac6', fontSize: '0.72rem' }}>
                      <span style={{ color: '#2e7d32' }}>✓ {promo.code} applied</span>
                      <button onClick={() => { setPromo(null); setPromoInput('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.65rem', fontFamily: 'inherit', padding: 0 }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                        onKeyDown={e => e.key === 'Enter' && applyPromo()}
                        placeholder="Promo code"
                        style={{ flex: 1, border: '1px solid var(--gray-300)', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontFamily: 'inherit', outline: 'none', background: 'var(--white)' }}
                      />
                      <button onClick={applyPromo} disabled={promoLoading || !promoInput.trim()} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem', fontSize: '0.65rem' }}>
                        {promoLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoError && <p style={{ fontSize: '0.65rem', color: '#c62828', marginTop: '0.35rem' }}>{promoError}</p>}
                </div>

                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#2e7d32' }}>
                      <span>Discount ({promo?.code})</span><span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    <span>Delivery</span>
                    <span style={{ color: deliveryFee === 0 ? 'var(--sand)' : 'inherit' }}>
                      {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                    <span>VAT (14%) included</span><span>{formatPrice(vat)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 500, paddingTop: '0.625rem', borderTop: '1px solid var(--gray-200)', marginTop: '0.25rem' }}>
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                {deliveryFee > 0 && (
                  <p style={{ fontSize: '0.65rem', color: 'var(--sand)', marginTop: '0.75rem', letterSpacing: '0.03em' }}>
                    Add {formatPrice(DELIVERY_THRESHOLD - subtotal)} more for free delivery
                  </p>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                  {step === 'cart' ? (
                    <button onClick={proceedToCheckout} className="btn btn-black btn-full"
                      style={{ padding: '1.1rem', fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                      Proceed to Checkout
                    </button>
                  ) : (
                    <button onClick={placeOrder} disabled={loading} className="btn btn-black btn-full"
                      style={{ padding: '1.1rem', fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                      {loading ? 'Placing Order…' : payMethod === 'card' ? 'Pay with Card' : 'Place Order'}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.62rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '1rem', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                  Free delivery on orders over EGP 500<br />
                  2-3 business days within Cairo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
