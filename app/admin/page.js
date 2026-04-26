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
  const [newBundle, setNewBundle] = useState({ name: '', description: '', imageUrl: '', priceAed: '' })
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
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id))
    else alert('Could not delete product')
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <input className="input-line" placeholder="Bundle name" value={newBundle.name}
                        onChange={e => setNewBundle(b => ({ ...b, name: e.target.value }))} />
                      <input className="input-line" placeholder="Price (EGP)" type="number" value={newBundle.priceAed}
                        onChange={e => setNewBundle(b => ({ ...b, priceAed: e.target.value }))} />
                      <input className="input-line" placeholder="Image URL (optional)" value={newBundle.imageUrl}
                        onChange={e => setNewBundle(b => ({ ...b, imageUrl: e.target.value }))} />
                      <input className="input-line" placeholder="Description (optional)" value={newBundle.description}
                        onChange={e => setNewBundle(b => ({ ...b, description: e.target.value }))} />
                    </div>
                    <button className="btn btn-black btn-sm" onClick={async () => {
                      if (!newBundle.name || !newBundle.priceAed) return alert('Name and price required')
                      const res = await fetch('/api/bundles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBundle) })
                      if (res.ok) {
                        const b = await res.json()
                        setBundles(prev => [b, ...prev])
                        setNewBundle({ name: '', description: '', imageUrl: '', priceAed: '' })
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
                              <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>{b.items?.length || 0}</td>
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
function VariantImageUpload({ image, onChange }) {
  const [uploading,    setUploading]    = useState(false)
  const [localPreview, setLocalPreview] = useState(null)
  const [uploadError,  setUploadError]  = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.urls?.[0]) {
        onChange(data.urls[0])
        setLocalPreview(null)
      } else {
        throw new Error(data.error || 'Upload returned no URL')
      }
    } catch (err) {
      setLocalPreview(null)
      setUploadError('Upload failed')
      console.error('Variant image upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const displayImage = localPreview || image || null

  return (
    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <label className="label" style={{ marginBottom: 0 }}>Variant Image</label>
      {displayImage && (
        <img src={displayImage} alt="" style={{ width: 40, height: 48, objectFit: 'cover', border: '1px solid var(--gray-mid)', opacity: uploading ? 0.5 : 1 }} />
      )}
      <label style={{ cursor: uploading ? 'default' : 'pointer', fontSize: '0.7rem', color: uploading ? 'var(--gray-400)' : 'var(--gray-text)', textDecoration: 'underline' }}>
        {uploading ? 'Uploading…' : displayImage ? 'Change' : 'Upload'}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
      {!uploading && displayImage && (
        <button type="button" onClick={() => { onChange(''); setLocalPreview(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: '#EF4444', fontFamily: 'inherit' }}>Remove</button>
      )}
      {uploadError && <span style={{ fontSize: '0.65rem', color: '#EF4444' }}>{uploadError}</span>}
    </div>
  )
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const isNew = !product.id
  const [form,    setForm]    = useState({ ...product })
  const [variants, setVariants] = useState(product.variants?.length ? product.variants : [{ size: '', color: '', colorHex: '#000000', material: '', priceAed: '', stockQty: '', skuCode: '', image: '' }])
  const [images,  setImages]  = useState(
    (product.images || []).map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
  )
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }
  function setVariantField(idx, k, v) { setVariants(prev => prev.map((vr, i) => i === idx ? { ...vr, [k]: v } : vr)) }
  function addVariant() { setVariants(p => [...p, { size: '', color: '', colorHex: '#000000', material: '', priceAed: '', stockQty: '', skuCode: '', image: '' }]) }
  function removeVariant(idx) { setVariants(p => p.filter((_, i) => i !== idx)) }

  async function save() {
    setError('')
    setSaving(true)
    try {
      const body = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        variants: variants.map(v => ({ ...v, priceAed: Number(v.priceAed), stockQty: Number(v.stockQty) })),
        imageUrls: images,
      }
      const res = await fetch(isNew ? '/api/products' : `/api/products/${product.id}`, {
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
        {/* Left column */}
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

          {/* Images */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.875rem' }}>
              Upload Product Images (up to 5)
            </div>
            <ImageDropzone images={images} onChange={setImages} max={5} />
          </div>
        </div>

        {/* Right column — variants */}
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.75rem' }}>Variants</div>
          {variants.map((v, idx) => (
            <div key={idx} style={{ border: '1px solid var(--gray-mid)', padding: '1rem', marginBottom: '0.75rem', position: 'relative' }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '0.75rem' }}>Variant {idx + 1}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { key: 'size',     label: 'Size',     placeholder: 'M' },
                  { key: 'color',    label: 'Color',    placeholder: 'White' },
                  { key: 'material', label: 'Material', placeholder: '100% Cotton' },
                  { key: 'skuCode',  label: 'SKU',      placeholder: 'DIF-001-M-WHT' },
                  { key: 'priceAed', label: 'Price (EGP)', placeholder: '149', type: 'number' },
                  { key: 'stockQty', label: 'Stock',    placeholder: '50', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input className="input" type={f.type || 'text'} placeholder={f.placeholder} value={v[f.key] || ''} onChange={e => setVariantField(idx, f.key, e.target.value)} style={{ fontSize: '0.75rem' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label className="label" style={{ marginBottom: 0 }}>Color Hex</label>
                <input type="color" value={v.colorHex || '#000000'} onChange={e => setVariantField(idx, 'colorHex', e.target.value)} style={{ width: '36px', height: '28px', border: '1px solid var(--gray-mid)', cursor: 'pointer', padding: '1px' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-text)' }}>{v.colorHex}</span>
              </div>
              <VariantImageUpload image={v.image || ''} onChange={url => setVariantField(idx, 'image', url)} />
              {variants.length > 1 && (
                <button onClick={() => removeVariant(idx)}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#EF4444', fontFamily: 'inherit' }}>Remove</button>
              )}
            </div>
          ))}
          <button onClick={addVariant} className="btn btn-outline btn-sm" style={{ width: '100%' }}>+ Add Variant</button>
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
