'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar.js'
import { formatPrice } from '../../lib/format.js'
import ImageDropzone from '../../components/ImageDropzone.js'

const TABS = ['Analytics', 'Products', 'Orders', 'Customers', 'Bundles', 'Promos']

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminPage() {
  const router = useRouter()
  const [tab,       setTab]       = useState('Analytics')
  const [products,  setProducts]  = useState([])
  const [orders,    setOrders]    = useState([])
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editProd,  setEditProd]  = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState('')
  const [categories, setCategories] = useState([])
  const [stats,     setStats]     = useState(null)
  const [bundles,   setBundles]   = useState([])
  const [promos,    setPromos]    = useState([])
  const [newBundle, setNewBundle] = useState({ name: '', description: '', priceAed: '' })
  const [bundleProductIds, setBundleProductIds] = useState(['', ''])
  const [newPromo,  setNewPromo]  = useState({ code: '', discountType: 'percent', discountValue: '', minOrderAed: '', maxUses: '', expiresAt: '' })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'admin') { router.push('/login'); return }
    loadAll()
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []))
    fetch('/api/bundles').then(r => r.json()).then(d => setBundles(Array.isArray(d) ? d : []))
    fetch('/api/admin/promos').then(r => r.json()).then(d => setPromos(Array.isArray(d) ? d : []))
  }, [])

  async function loadAll() {
    setLoading(true)
    const [p, o, c, s] = await Promise.all([
      fetch('/api/products?limit=200').then(r => r.json()).catch(() => []),
      fetch('/api/orders?all=true').then(r => r.json()).catch(() => []),
      fetch('/api/admin/users').then(r => r.json()).catch(() => []),
      fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
    ])
    setProducts(Array.isArray(p) ? p : [])
    setOrders(Array.isArray(o) ? o : [])
    setCustomers(Array.isArray(c) ? c : [])
    setStats(s)
    setLoading(false)
  }

  async function updateOrderStatus(orderId, status) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return
    try {
      const res  = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
        flash(data.message || 'Product deleted')
      } else {
        alert('Error: ' + (data.error || 'Could not delete product'))
      }
    } catch (err) {
      alert('Network error: ' + err.message)
    }
  }

  async function toggleFeatured(product) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !product.isFeatured }),
    })
    if (res.ok) setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p))
  }

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const allCats = categories.flatMap(c => [c, ...(c.children || [])])
  const [openOrder, setOpenOrder] = useState(null)

  return (
    <>
      <Navbar isAdmin />

      <div className="page-body" style={{ minHeight: '100vh', background: 'var(--gray-100)' }}>
        {/* Header */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-300)', padding: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.25rem' }}>Administration</div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.1em' }}>Dashboard</h1>
            </div>
            <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
              {[
                { label: 'Products', val: products.length },
                { label: 'Orders',   val: orders.length },
                { label: 'Customers', val: customers.length },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.05em' }}>{s.val}</div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-text)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-mid)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--black)' : '2px solid transparent', padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', color: tab === t ? 'var(--black)' : 'var(--gray-text)', fontWeight: tab === t ? 500 : 400 }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{ background: 'var(--black)', color: 'var(--white)', textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{msg}</div>
        )}

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--gray-text)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</div>
          ) : (
            <>
              {/* ── ANALYTICS TAB ── */}
              {tab === 'Analytics' && stats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                  {/* KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--gray-mid)' }}>
                    {[
                      { label: 'Total Revenue',     value: formatPrice(stats.totalRevenue), sub: 'All confirmed orders' },
                      { label: 'Total Orders',      value: stats.orderCount,                sub: `${stats.pendingOrders} pending` },
                      { label: 'Avg Order Value',   value: formatPrice(stats.avgOrderValue), sub: 'Per confirmed order' },
                      { label: 'Customers',         value: stats.userCount,                                                                               sub: 'Registered buyers' },
                      { label: 'Active Products',   value: stats.productCount,                                                                            sub: 'Published items' },
                    ].map(k => (
                      <div key={k.label} style={{ background: 'var(--white)', padding: '1.75rem 2rem' }}>
                        <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.75rem' }}>{k.label}</div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 300, letterSpacing: '0.02em', marginBottom: '0.35rem' }}>{k.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--gray-text)', letterSpacing: '0.04em' }}>{k.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue Chart */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)', padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.4rem' }}>Monthly Revenue</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 300 }}>Last 12 Months</div>
                    </div>
                    {(() => {
                      const data    = stats.monthlyData || []
                      const maxVal  = Math.max(...data.map(d => d.revenue), 1)
                      const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '180px', paddingBottom: '2rem', position: 'relative' }}>
                          {/* Y-axis gridlines */}
                          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                            <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(2rem + ${pct * 100}%)`, borderTop: pct === 0 ? '1px solid var(--gray-mid)' : '1px dashed var(--gray-100)', display: 'flex', alignItems: 'center' }}>
                              {pct > 0 && <span style={{ fontSize: '0.55rem', color: 'var(--gray-text)', marginLeft: 0, whiteSpace: 'nowrap', transform: 'translateY(-50%)' }}>{formatPrice(maxVal * pct)}</span>}
                            </div>
                          ))}
                          {data.map((d, i) => {
                            const pct   = maxVal > 0 ? d.revenue / maxVal : 0
                            const mo    = Number(d.month.split('-')[1]) - 1
                            const isNow = i === data.length - 1
                            return (
                              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ width: '100%', background: isNow ? 'var(--black)' : 'var(--gray-300)', height: `${Math.max(pct * 100, pct > 0 ? 2 : 0)}%`, transition: 'height 0.4s ease', position: 'relative', minHeight: d.revenue > 0 ? '2px' : '0' }}
                                  title={formatPrice(d.revenue)}>
                                  {d.revenue > 0 && (
                                    <div style={{ position: 'absolute', top: '-1.4rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.5rem', color: 'var(--black)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                      {d.revenue >= 1000 ? `${(d.revenue/1000).toFixed(1)}k` : d.revenue.toFixed(0)}
                                    </div>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.5rem', letterSpacing: '0.06em', color: isNow ? 'var(--black)' : 'var(--gray-text)', textTransform: 'uppercase', fontWeight: isNow ? 500 : 400 }}>{months[mo]}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Top Products */}
                    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)', padding: '2rem' }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.4rem' }}>Top Products</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 300, marginBottom: '1.5rem' }}>By Units Sold</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(stats.topProducts || []).map((p, i) => {
                          const maxSold = stats.topProducts[0]?.unitsSold || 1
                          return (
                            <div key={p.productId || i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--black)' }}>{p.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--gray-text)' }}>{p.unitsSold} sold</span>
                              </div>
                              <div style={{ height: '3px', background: 'var(--gray-100)', borderRadius: '2px' }}>
                                <div style={{ height: '100%', width: `${(p.unitsSold / maxSold) * 100}%`, background: 'var(--black)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                              </div>
                            </div>
                          )
                        })}
                        {(stats.topProducts || []).length === 0 && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>No sales data yet</p>
                        )}
                      </div>
                    </div>

                    {/* Order Status Breakdown */}
                    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)', padding: '2rem' }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.4rem' }}>Order Status</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 300, marginBottom: '1.5rem' }}>Breakdown</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => {
                          const colors = { pending: '#C9A96E', confirmed: '#3B82F6', processing: '#3B82F6', shipped: '#059669', delivered: '#059669', cancelled: '#EF4444' }
                          const total  = Object.values(stats.statusBreakdown).reduce((s, n) => s + n, 0)
                          return (
                            <div key={status}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', color: 'var(--black)' }}>{status}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--gray-text)' }}>{count} ({total ? Math.round(count / total * 100) : 0}%)</span>
                              </div>
                              <div style={{ height: '3px', background: 'var(--gray-100)', borderRadius: '2px' }}>
                                <div style={{ height: '100%', width: total ? `${count / total * 100}%` : '0%', background: colors[status] || 'var(--gray-mid)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--gray-mid)' }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.25rem' }}>Recent Activity</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 300 }}>Latest Orders</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                          {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1.25rem', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', fontWeight: 500, textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(stats.recentOrders || []).map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                            <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.72rem', fontWeight: 500 }}>#{o.id}</td>
                            <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.72rem' }}>{o.user?.name || o.user?.email || '—'}</td>
                            <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.72rem', color: 'var(--gray-text)' }}>
                              {o.items?.slice(0, 2).map(it => it.variant?.product?.name).join(', ')}
                              {o.items?.length > 2 ? ` +${o.items.length - 2}` : ''}
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.72rem', fontWeight: 500 }}>{formatPrice(o.totalAed)}</td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: { pending: '#C9A96E', confirmed: '#3B82F6', processing: '#3B82F6', shipped: '#059669', delivered: '#059669', cancelled: '#EF4444' }[o.status] || 'var(--gray-text)' }}>
                                {o.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.72rem', color: 'var(--gray-text)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── PRODUCTS TAB ── */}
              {tab === 'Products' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <button onClick={() => setEditProd({ name: '', brand: 'Diffuse', gender: '', season: '', isActive: true, isFeatured: false, categoryId: '', description: '', care: '', variants: [{ size: '', color: '', colorHex: '#000000', material: '', priceAed: '', stockQty: '', skuCode: '', image: '' }], images: [] })}
                      className="btn btn-black btn-sm">Add Product</button>
                  </div>

                  {editProd && <ProductForm product={editProd} categories={allCats} onClose={() => setEditProd(null)} onSaved={(p, isNew) => { if (isNew) setProducts(prev => [p, ...prev]); else setProducts(prev => prev.map(x => x.id === p.id ? p : x)); setEditProd(null); flash('Saved') }} />}

                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                          {['Name', 'Gender', 'Category', 'Price', 'Stock', 'Featured', 'Active', ''].map(h => (
                            <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', fontWeight: 500, textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => {
                          const minPrice = p.variants?.length ? Math.min(...p.variants.map(v => Number(v.priceAed))) : null
                          const totalStock = p.variants?.reduce((s, v) => s + v.stockQty, 0) ?? 0
                          return (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontWeight: 500 }}>{p.name}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{p.gender || '—'}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{p.category?.name || '—'}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem' }}>{minPrice != null ? formatPrice(minPrice) : '—'}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: totalStock === 0 ? '#EF4444' : 'var(--black)' }}>{totalStock}</td>
                              <td style={{ padding: '0.875rem 1rem' }}>
                                <button onClick={() => toggleFeatured(p)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: p.isFeatured ? 'var(--sand)' : 'var(--gray-text)', fontFamily: 'inherit' }}>
                                  {p.isFeatured ? 'Yes' : 'No'}
                                </button>
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: p.isActive ? '#059669' : '#EF4444' }}>
                                {p.isActive ? 'Active' : 'Hidden'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                  <button onClick={() => setEditProd(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--black)', fontFamily: 'inherit', borderBottom: '1px solid var(--black)', paddingBottom: '1px' }}>Edit</button>
                                  <button onClick={() => deleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#EF4444', fontFamily: 'inherit', borderBottom: '1px solid #EF4444', paddingBottom: '1px' }}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── ORDERS TAB ── */}
              {tab === 'Orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--gray-mid)' }}>
                  {orders.length === 0 && (
                    <div style={{ background: 'var(--white)', padding: '4rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-text)' }}>No orders yet</div>
                  )}
                  {orders.map(o => (
                    <div key={o.id} style={{ background: 'var(--white)' }}>
                      {/* Order row header */}
                      <button
                        onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)}
                        style={{
                          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                          padding: '1rem 1.25rem',
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 1fr 80px 100px 160px 24px',
                          gap: '1rem',
                          alignItems: 'center',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>#{o.id}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-text)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB')}</span>
                        <span style={{ fontSize: '0.72rem' }}>{o.user?.name || o.user?.email || '—'}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-text)' }}>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>{formatPrice(o.totalAed)}</span>
                        <div onClick={e => e.stopPropagation()}>
                          <select value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            style={{ fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid var(--gray-mid)', padding: '0.25rem 0.5rem', background: 'var(--white)', fontFamily: 'inherit', cursor: 'pointer', width: '100%' }}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <span style={{ color: 'var(--gray-text)', fontSize: '0.75rem', transition: 'transform 0.2s', display: 'inline-block', transform: openOrder === o.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                      </button>

                      {/* Expanded: purchased items */}
                      {openOrder === o.id && (
                        <div style={{ borderTop: '1px solid var(--gray-100)', padding: '1.25rem 1.5rem 1.5rem', background: 'var(--gray-100)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
                            <div>
                              <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.5rem' }}>Items Ordered</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {o.items?.map((item, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: '0.625rem 0.875rem', border: '1px solid var(--gray-mid)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--black)' }}>
                                        {item.variant?.product?.name || 'Product'}
                                      </span>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--gray-text)' }}>
                                        {[item.variant?.size && `Size ${item.variant.size}`, item.variant?.color].filter(Boolean).join(' · ')}
                                        {' '}× {item.quantity ?? item.qty ?? 1}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                      {formatPrice(Number(item.priceAed) * (item.quantity ?? item.qty ?? 1))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div>
                                <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.4rem' }}>Delivery Address</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--black)', lineHeight: 1.6 }}>{o.deliveryAddress || '—'}</p>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.4rem' }}>Payment</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--black)' }}>
                                  {o.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : o.paymentMethod || '—'}
                                </p>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.4rem' }}>Order Total</div>
                                <p style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>{formatPrice(o.totalAed)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── CUSTOMERS TAB ── */}
              {tab === 'Customers' && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                        {['Name', 'Email', 'Phone', 'City', 'Joined', 'Orders'].map(h => (
                          <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', fontWeight: 500, textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontWeight: 500 }}>{c.name || '—'}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{c.email}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{c.phone || '—'}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{c.city || '—'}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem' }}>{c._count?.orders ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'Bundles' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Create bundle */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)', padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '1.25rem' }}>Create Bundle</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                      <input className="input-line" placeholder="Bundle name" value={newBundle.name}
                        onChange={e => setNewBundle(b => ({ ...b, name: e.target.value }))} />
                      <input className="input-line" placeholder="Bundle price (EGP)" type="number" value={newBundle.priceAed}
                        onChange={e => setNewBundle(b => ({ ...b, priceAed: e.target.value }))} />
                      <input className="input-line" placeholder="Description (optional)" value={newBundle.description}
                        onChange={e => setNewBundle(b => ({ ...b, description: e.target.value }))} />
                    </div>

                    {/* Dynamic product list */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.625rem' }}>Products in bundle</div>
                      {bundleProductIds.map((pid, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--gray-text)', minWidth: '16px' }}>{idx + 1}.</span>
                          <select className="input-line" value={pid} style={{ flex: 1 }}
                            onChange={e => setBundleProductIds(prev => prev.map((v, i) => i === idx ? e.target.value : v))}>
                            <option value="">— Select product —</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          {bundleProductIds.length > 2 && (
                            <button type="button"
                              onClick={() => setBundleProductIds(prev => prev.filter((_, i) => i !== idx))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--gray-text)', lineHeight: 1, padding: '0 4px' }}>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button"
                        onClick={() => setBundleProductIds(prev => [...prev, ''])}
                        style={{ marginTop: '0.25rem', background: 'none', border: '1px dashed var(--gray-mid)', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--gray-text)', fontFamily: 'inherit', padding: '5px 12px', letterSpacing: '0.08em' }}>
                        + Add another product
                      </button>
                    </div>

                    <button className="btn btn-black btn-sm" onClick={async () => {
                      if (!newBundle.name || !newBundle.priceAed) return alert('Name and price required')
                      const selected = bundleProductIds.filter(Boolean)
                      if (selected.length < 2) return alert('Select at least 2 products')
                      const items = selected.map(pid => {
                        const p = products.find(x => String(x.id) === String(pid))
                        const variantId = p?.variants?.[0]?.id
                        return variantId ? { variantId, quantity: 1 } : null
                      }).filter(Boolean)
                      if (items.length < 2) return alert('Selected products have no variants')
                      const res = await fetch('/api/bundles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newBundle.name, description: newBundle.description, priceAed: newBundle.priceAed, items }) })
                      if (res.ok) {
                        const b = await res.json()
                        setBundles(prev => [b, ...prev])
                        setNewBundle({ name: '', description: '', priceAed: '' })
                        setBundleProductIds(['', ''])
                      } else alert('Failed to create bundle')
                    }}>Create Bundle</button>
                  </div>

                  {/* Bundle list */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)' }}>
                    {bundles.length === 0 ? (
                      <p style={{ padding: '2rem', color: 'var(--gray-text)', fontSize: '0.8rem' }}>No bundles yet.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                            {['Name', 'Price', 'Items', 'Active', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', fontWeight: 500, textAlign: 'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bundles.map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontWeight: 500 }}>{b.name}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem' }}>{formatPrice(b.priceAed)}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                                {b.items?.map(i => i.variant?.product?.name || `Variant #${i.variantId}`).join(' + ') || '—'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem' }}>
                                <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em', color: b.isActive ? '#2e7d32' : 'var(--gray-text)' }}>
                                  {b.isActive ? 'Active' : 'Hidden'}
                                </span>
                              </td>
                              <td style={{ padding: '0.875rem 1rem' }}>
                                <button onClick={async () => {
                                  if (!confirm('Delete this bundle?')) return
                                  const res = await fetch(`/api/bundles/${b.id}`, { method: 'DELETE' })
                                  if (res.ok) setBundles(prev => prev.filter(x => x.id !== b.id))
                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', color: '#c62828', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {tab === 'Promos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Create promo */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)', padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '1.25rem' }}>Create Promo Code</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <input className="input-line" placeholder="Code (e.g. WELCOME10)" value={newPromo.code}
                        onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                      <select className="input-line" value={newPromo.discountType}
                        onChange={e => setNewPromo(p => ({ ...p, discountType: e.target.value }))}>
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (EGP)</option>
                      </select>
                      <input className="input-line" placeholder="Discount value" type="number" value={newPromo.discountValue}
                        onChange={e => setNewPromo(p => ({ ...p, discountValue: e.target.value }))} />
                      <input className="input-line" placeholder="Min order EGP (optional)" type="number" value={newPromo.minOrderAed}
                        onChange={e => setNewPromo(p => ({ ...p, minOrderAed: e.target.value }))} />
                      <input className="input-line" placeholder="Max uses (optional)" type="number" value={newPromo.maxUses}
                        onChange={e => setNewPromo(p => ({ ...p, maxUses: e.target.value }))} />
                      <input className="input-line" placeholder="Expires at (optional)" type="date" value={newPromo.expiresAt}
                        onChange={e => setNewPromo(p => ({ ...p, expiresAt: e.target.value }))} />
                    </div>
                    <button className="btn btn-black btn-sm" onClick={async () => {
                      if (!newPromo.code || !newPromo.discountValue) return alert('Code and discount required')
                      const res = await fetch('/api/admin/promos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPromo) })
                      const data = await res.json()
                      if (res.ok) {
                        setPromos(prev => [data, ...prev])
                        setNewPromo({ code: '', discountType: 'percent', discountValue: '', minOrderAed: '', maxUses: '', expiresAt: '' })
                      } else alert(data.error || 'Failed to create promo')
                    }}>Create Promo</button>
                  </div>

                  {/* Promo list */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)' }}>
                    {promos.length === 0 ? (
                      <p style={{ padding: '2rem', color: 'var(--gray-text)', fontSize: '0.8rem' }}>No promo codes yet.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                            {['Code', 'Discount', 'Min Order', 'Used / Max', 'Expires', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', fontWeight: 500, textAlign: 'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {promos.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>{p.code}</td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem' }}>
                                {p.discountType === 'percent' ? `${Number(p.discountValue)}%` : formatPrice(p.discountValue)}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                                {p.minOrderAed ? formatPrice(p.minOrderAed) : '—'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                                {p.usedCount} / {p.maxUses ?? '∞'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                                {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('en-GB') : '—'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button onClick={async () => {
                                  const res = await fetch(`/api/admin/promos/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !p.isActive }) })
                                  if (res.ok) setPromos(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !p.isActive } : x))
                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', color: p.isActive ? '#c62828' : '#2e7d32', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
                                  {p.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={async () => {
                                  if (!confirm('Delete this promo?')) return
                                  const res = await fetch(`/api/admin/promos/${p.id}`, { method: 'DELETE' })
                                  if (res.ok) setPromos(prev => prev.filter(x => x.id !== p.id))
                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', color: '#c62828', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ─── Inline Product Form ─── */

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '28', '30', 'One Size']

function makeEmptySizes() {
  return Object.fromEntries(AVAILABLE_SIZES.map(s => [s, { enabled: false, price: '', stock: '', sku: '' }]))
}

function makeEmptyColor() {
  return { id: Date.now() + Math.random(), name: '', hex: '#000000', image: '', imagePreview: '', uploading: false, sizes: makeEmptySizes() }
}

function variantsToColors(variants) {
  if (!variants?.length) return [makeEmptyColor()]
  const map = {}
  const order = []
  variants.forEach(v => {
    const key = v.colorHex || v.color || '__none__'
    if (!map[key]) {
      map[key] = { id: Date.now() + Math.random(), name: v.color || '', hex: v.colorHex || '#000000', image: v.image || '', imagePreview: v.image || '', uploading: false, sizes: makeEmptySizes() }
      order.push(key)
    }
    const size = v.size || ''
    if (AVAILABLE_SIZES.includes(size)) {
      map[key].sizes[size] = { enabled: true, price: String(v.priceAed ?? ''), stock: String(v.stockQty ?? ''), sku: v.skuCode || '' }
    }
  })
  return order.map(k => map[k])
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const isNew = !product.id
  const [form,   setForm]   = useState({ ...product })
  const [colors, setColors] = useState(() => variantsToColors(product.variants))
  const [images, setImages] = useState(
    (product.images || []).map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  const addColor    = () => setColors(prev => [...prev, makeEmptyColor()])
  const removeColor = (id) => setColors(prev => prev.filter(c => c.id !== id))
  const updateColor = (id, field, value) => setColors(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))

  const toggleSize = (id, size, enabled) =>
    setColors(prev => prev.map(c => c.id === id ? { ...c, sizes: { ...c.sizes, [size]: { ...c.sizes[size], enabled } } } : c))

  const updateSizeData = (id, size, field, value) =>
    setColors(prev => prev.map(c => c.id === id ? { ...c, sizes: { ...c.sizes, [size]: { ...c.sizes[size], [field]: value } } } : c))

  const applyPriceToAll = (id) => {
    const col = colors.find(c => c.id === id)
    const first = Object.entries(col.sizes).find(([, s]) => s.enabled && s.price)
    if (!first) return
    const price = first[1].price
    setColors(prev => prev.map(c => {
      if (c.id !== id) return c
      const sizes = { ...c.sizes }
      Object.keys(sizes).forEach(sz => { if (sizes[sz].enabled) sizes[sz] = { ...sizes[sz], price } })
      return { ...c, sizes }
    }))
  }

  const applyStockToAll = (id) => {
    const col = colors.find(c => c.id === id)
    const first = Object.entries(col.sizes).find(([, s]) => s.enabled && s.stock)
    if (!first) return
    const stock = first[1].stock
    setColors(prev => prev.map(c => {
      if (c.id !== id) return c
      const sizes = { ...c.sizes }
      Object.keys(sizes).forEach(sz => { if (sizes[sz].enabled) sizes[sz] = { ...sizes[sz], stock } })
      return { ...c, sizes }
    }))
  }

  async function handleColorImageUpload(id, file) {
    if (!file) return
    const preview = URL.createObjectURL(file)
    updateColor(id, 'imagePreview', preview)
    updateColor(id, 'uploading', true)
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.urls?.[0]) {
        updateColor(id, 'image', data.urls[0])
        updateColor(id, 'imagePreview', data.urls[0])
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err) {
      updateColor(id, 'imagePreview', '')
      alert('Image upload failed: ' + err.message)
    } finally {
      updateColor(id, 'uploading', false)
    }
  }

  function buildVariants() {
    const out = []
    colors.forEach(col => {
      AVAILABLE_SIZES.forEach(size => {
        const s = col.sizes[size]
        if (s?.enabled) {
          out.push({
            color:    col.name,
            colorHex: col.hex,
            image:    col.image || null,
            size,
            priceAed: parseFloat(s.price) || 0,
            stockQty: parseInt(s.stock)   || 0,
            skuCode:  s.sku || `${(form.name || 'PROD').substring(0, 4).toUpperCase()}-${col.name.replace(/\s/g, '').substring(0, 3).toUpperCase()}-${size}`,
          })
        }
      })
    })
    return out
  }

  async function save() {
    setError('')
    setSaving(true)
    try {
      const body = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        variants:   buildVariants(),
        imageUrls:  images,
      }
      const res  = await fetch(isNew ? '/api/products' : `/api/products/${product.id}`, {
        method:  isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Save failed'); return }
      onSaved(data, isNew)
    } catch {
      setError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-mid)', padding: '2rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {isNew ? 'Add Product' : 'Edit Product'}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--gray-text)', fontFamily: 'inherit' }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left column — product info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.25rem' }}>Product Info</div>
          {[
            { key: 'name',    label: 'Name',    placeholder: 'Essential White Tee' },
            { key: 'brand',   label: 'Brand',   placeholder: 'Diffuse' },
            { key: 'gender',  label: 'Gender',  placeholder: 'Men / Women / Unisex' },
            { key: 'season',  label: 'Season',  placeholder: 'SS25' },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setField(f.key, e.target.value)} style={{ fontSize: '0.8rem' }} />
            </div>
          ))}
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.categoryId || ''} onChange={e => setField('categoryId', e.target.value)} style={{ fontSize: '0.8rem' }}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.parentId ? `  — ${c.name}` : c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Product description..." value={form.description || ''} onChange={e => setField('description', e.target.value)} style={{ fontSize: '0.8rem', resize: 'vertical' }} />
          </div>
          <div>
            <label className="label">Care Instructions</label>
            <input className="input" placeholder="Machine wash 30°C" value={form.care || ''} onChange={e => setField('care', e.target.value)} style={{ fontSize: '0.8rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setField('isActive', e.target.checked)} /> Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
              <input type="checkbox" checked={form.isFeatured} onChange={e => setField('isFeatured', e.target.checked)} /> Featured
            </label>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.875rem' }}>
              Product Images (up to 5)
            </div>
            <ImageDropzone images={images} onChange={setImages} max={5} />
          </div>
        </div>

        {/* Right column — color + size variants */}
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '1rem' }}>
            Colors &amp; Sizes
          </div>

          {colors.map((col, colIdx) => {
            const enabledSizes = Object.entries(col.sizes).filter(([, s]) => s.enabled)
            return (
              <div key={col.id} style={{ border: '1px solid var(--gray-mid)', borderRadius: '6px', padding: '1.25rem', marginBottom: '1rem' }}>

                {/* Color header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {/* Swatch */}
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: col.hex, border: '1px solid var(--gray-mid)', flexShrink: 0 }} />

                  {/* Color name */}
                  <input
                    value={col.name}
                    onChange={e => updateColor(col.id, 'name', e.target.value)}
                    placeholder="Color name (e.g. Navy Blue)"
                    style={{ flex: 1, minWidth: '120px', padding: '6px 10px', border: '1px solid var(--gray-mid)', fontSize: '0.8rem', fontFamily: 'inherit', borderRadius: '3px' }}
                  />

                  {/* Hex picker */}
                  <input
                    type="color"
                    value={col.hex}
                    onChange={e => updateColor(col.id, 'hex', e.target.value)}
                    style={{ width: '36px', height: '32px', border: '1px solid var(--gray-mid)', cursor: 'pointer', padding: '1px', borderRadius: '3px', flexShrink: 0 }}
                    title="Pick color"
                  />

                  {/* Color image upload */}
                  {col.imagePreview ? (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={col.imagePreview} alt="" style={{ width: '44px', height: '52px', objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--gray-mid)', opacity: col.uploading ? 0.5 : 1 }} />
                      <button
                        type="button"
                        onClick={() => { updateColor(col.id, 'image', ''); updateColor(col.id, 'imagePreview', '') }}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                        x
                      </button>
                    </div>
                  ) : (
                    <label style={{ cursor: col.uploading ? 'default' : 'pointer', flexShrink: 0 }}>
                      <div style={{ width: '44px', height: '52px', border: '1px dashed var(--gray-mid)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--gray-text)', textAlign: 'center', lineHeight: 1.3 }}>
                        {col.uploading ? '...' : 'Photo'}
                      </div>
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={col.uploading}
                        onChange={e => { if (e.target.files?.[0]) handleColorImageUpload(col.id, e.target.files[0]); e.target.value = '' }} />
                    </label>
                  )}

                  {/* Remove color */}
                  {colors.length > 1 && (
                    <button type="button" onClick={() => removeColor(col.id)}
                      style={{ background: 'none', border: '1px solid var(--gray-mid)', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--gray-text)', fontFamily: 'inherit', padding: '5px 10px', borderRadius: '3px', flexShrink: 0 }}>
                      Remove
                    </button>
                  )}
                </div>

                {/* Size checkboxes */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gray-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Available sizes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {AVAILABLE_SIZES.map(size => (
                      <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.72rem' }}>
                        <input
                          type="checkbox"
                          checked={col.sizes[size]?.enabled || false}
                          onChange={e => toggleSize(col.id, size, e.target.checked)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price / stock table for enabled sizes */}
                {enabledSizes.length > 0 && (
                  <div>
                    {/* Bulk apply */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => applyPriceToAll(col.id)}
                        style={{ fontSize: '0.65rem', padding: '4px 10px', border: '1px solid var(--gray-mid)', background: 'var(--gray-100)', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '3px' }}>
                        Apply price to all
                      </button>
                      <button type="button" onClick={() => applyStockToAll(col.id)}
                        style={{ fontSize: '0.65rem', padding: '4px 10px', border: '1px solid var(--gray-mid)', background: 'var(--gray-100)', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '3px' }}>
                        Apply stock to all
                      </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                          {['Size', 'Price (EGP)', 'Stock', 'SKU'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-text)', fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {AVAILABLE_SIZES.filter(sz => col.sizes[sz]?.enabled).map(size => {
                          const s = col.sizes[size]
                          return (
                            <tr key={size} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                              <td style={{ padding: '6px 8px', fontWeight: 500 }}>{size}</td>
                              <td style={{ padding: '6px 8px' }}>
                                <input type="number" value={s.price} placeholder="0"
                                  onChange={e => updateSizeData(col.id, size, 'price', e.target.value)}
                                  style={{ width: '72px', padding: '5px 7px', border: '1px solid var(--gray-mid)', fontSize: '0.75rem', fontFamily: 'inherit', borderRadius: '3px' }} />
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                <input type="number" value={s.stock} placeholder="0"
                                  onChange={e => updateSizeData(col.id, size, 'stock', e.target.value)}
                                  style={{ width: '60px', padding: '5px 7px', border: '1px solid var(--gray-mid)', fontSize: '0.75rem', fontFamily: 'inherit', borderRadius: '3px' }} />
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                <input type="text" value={s.sku} placeholder="Auto"
                                  onChange={e => updateSizeData(col.id, size, 'sku', e.target.value)}
                                  style={{ width: '90px', padding: '5px 7px', border: '1px solid var(--gray-mid)', fontSize: '0.72rem', fontFamily: 'inherit', borderRadius: '3px' }} />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}

          <button type="button" onClick={addColor}
            style={{ width: '100%', padding: '10px', border: '1px dashed var(--gray-mid)', background: 'none', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-text)', fontFamily: 'inherit', borderRadius: '3px' }}>
            + Add Color
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--gray-mid)', paddingTop: '1.5rem' }}>
        <button onClick={onClose} className="btn btn-outline btn-sm">Cancel</button>
        <button onClick={save} className="btn btn-black btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
      </div>
    </div>
  )
}
