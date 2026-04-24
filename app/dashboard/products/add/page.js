'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../../components/Navbar.js'

const SIZES = ['XS','S','M','L','XL','XXL','28','30','32','34','36','38','40','42','One Size']
const GENDERS = ['Men','Women','Unisex','Kids']
const SEASONS = ['All Season','Summer','Winter','Spring/Autumn']

function emptyVariant(i) {
  return { id: i, size: 'M', color: '', colorHex: '#000000', material: '', priceAed: '', stockQty: '', skuCode: '' }
}

export default function AddProductPage() {
  const router = useRouter()
  const [step,       setStep]       = useState(1)
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const [details, setDetails] = useState({
    name: '', brand: '', categoryId: '', description: '', gender: 'Unisex', season: 'All Season',
  })
  const [variants, setVariants] = useState([emptyVariant(0)])
  const [images,   setImages]   = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'seller') { router.push('/login'); return }
    fetch('/api/categories').then(r => r.json()).then(cats => {
      setCategories(cats.flatMap(c => [c, ...(c.children || [])]))
    }).catch(() => {})
  }, [router])

  function setDetail(k, v) { setDetails(p => ({ ...p, [k]: v })) }

  function addVariant() {
    setVariants(prev => [...prev, emptyVariant(prev.length)])
  }
  function removeVariant(i) {
    setVariants(prev => prev.filter((_, idx) => idx !== i))
  }
  function setVariantField(i, key, val) {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v))
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files).slice(0, 5 - images.length)
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setImages(prev => [...prev, ...data.urls])
    } catch {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  function autoSku(v, i) {
    const brand = details.brand?.slice(0,4).toUpperCase() || 'PRD'
    const size  = (v.size || 'XX').toUpperCase()
    const color = (v.color || 'XX').slice(0,3).toUpperCase()
    return `${brand}-${size}-${color}-${i + 1}`
  }

  async function submit() {
    if (!details.name.trim()) { setError('Product name is required'); return }
    if (variants.some(v => !v.priceAed)) { setError('All variants must have a price'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...details,
          categoryId: details.categoryId || null,
          imageUrls: images,
          variants: variants.map((v, i) => ({
            ...v,
            skuCode: v.skuCode || autoSku(v, i),
            priceAed: Number(v.priceAed),
            stockQty: Number(v.stockQty) || 0,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create product'); return }
      router.push('/dashboard/products')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Product Details', 'Variants', 'Images', 'Review & Submit']

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <a href="/dashboard/products" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>← Products</a>
          <h1 className="heading-lg">Add New Product</h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '2px solid #E2E8F0' }}>
          {steps.map((s, i) => (
            <button key={s} onClick={() => step > i + 1 && setStep(i + 1)} style={{
              padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: step > i + 1 ? 'pointer' : 'default',
              fontWeight: step === i + 1 ? 600 : 400,
              color: step === i + 1 ? '#3B82F6' : step > i + 1 ? '#0F172A' : '#94A3B8',
              borderBottom: `2px solid ${step === i + 1 ? '#3B82F6' : 'transparent'}`,
              marginBottom: '-2px', fontSize: '0.875rem', fontFamily: 'inherit',
            }}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Product Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Product Name *</label>
                <input type="text" className="input" value={details.name} onChange={e => setDetail('name', e.target.value)} placeholder="Classic White Tee" />
              </div>
              <div>
                <label className="label">Brand</label>
                <input type="text" className="input" value={details.brand} onChange={e => setDetail('brand', e.target.value)} placeholder="Nike, Zara, etc." />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={details.categoryId} onChange={e => setDetail('categoryId', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.parentId ? '  — ' : ''}{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={details.gender} onChange={e => setDetail('gender', e.target.value)}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Season</label>
                <select className="input" value={details.season} onChange={e => setDetail('season', e.target.value)}>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Description</label>
                <textarea className="input" value={details.description} onChange={e => setDetail('description', e.target.value)} placeholder="Describe the product..." />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { if (!details.name.trim()) { setError('Product name required'); return } setError(''); setStep(2) }} className="btn btn-primary">
                Next: Variants
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Variants */}
        {step === 2 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Variants</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {variants.map((v, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Variant {i + 1}</span>
                    {variants.length > 1 && (
                      <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label className="label">Size</label>
                      <select className="input" value={v.size} onChange={e => setVariantField(i, 'size', e.target.value)}>
                        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Color Name</label>
                      <input type="text" className="input" value={v.color} onChange={e => setVariantField(i, 'color', e.target.value)} placeholder="White" />
                    </div>
                    <div>
                      <label className="label">Color Hex</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="color" value={v.colorHex} onChange={e => setVariantField(i, 'colorHex', e.target.value)}
                          style={{ width: '40px', height: '36px', border: '1.5px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
                        <input type="text" className="input" value={v.colorHex} onChange={e => setVariantField(i, 'colorHex', e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Material</label>
                      <input type="text" className="input" value={v.material} onChange={e => setVariantField(i, 'material', e.target.value)} placeholder="100% Cotton" />
                    </div>
                    <div>
                      <label className="label">Price (AED) *</label>
                      <input type="number" className="input" value={v.priceAed} onChange={e => setVariantField(i, 'priceAed', e.target.value)} placeholder="99" min="0" />
                    </div>
                    <div>
                      <label className="label">Stock Qty</label>
                      <input type="number" className="input" value={v.stockQty} onChange={e => setVariantField(i, 'stockQty', e.target.value)} placeholder="50" min="0" />
                    </div>
                    <div>
                      <label className="label">SKU (auto if empty)</label>
                      <input type="text" className="input" value={v.skuCode} onChange={e => setVariantField(i, 'skuCode', e.target.value)} placeholder={autoSku(v, i)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addVariant} className="btn btn-ghost" style={{ marginTop: '1rem', width: '100%' }}>
              + Add Another Variant
            </button>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost">Back</button>
              <button onClick={() => { if (variants.some(v => !v.priceAed)) { setError('All variants need a price'); return } setError(''); setStep(3) }} className="btn btn-primary">
                Next: Images
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Product Images (up to 5)</h2>

            {images.length < 5 && (
              <label style={{ display: 'block', border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                {uploading ? <div><div className="spinner spinner-blue" style={{ margin: '0 auto 0.5rem' }}></div><p style={{ color: '#64748B' }}>Uploading...</p></div>
                  : <><div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div><p style={{ color: '#64748B' }}>Click to upload images</p><p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>PNG, JPG up to 5MB each</p></>}
              </label>
            )}

            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {images.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: '100px', height: '125px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #E2E8F0' }} />
                    <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{
                      position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px',
                      borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                    }}>×</button>
                    {i === 0 && <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#0F172A', color: '#fff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px' }}>Main</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn btn-ghost">Back</button>
              <button onClick={() => setStep(4)} className="btn btn-primary">Next: Review</button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Review & Submit</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Product Details</h3>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <tbody>
                    {[['Name', details.name], ['Brand', details.brand || '—'], ['Gender', details.gender], ['Season', details.season]].map(([k,v]) => (
                      <tr key={k}><td style={{ color: '#64748B', padding: '0.25rem 0.5rem 0.25rem 0' }}>{k}</td><td style={{ fontWeight: 500 }}>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Variants ({variants.length})</h3>
                {variants.map((v, i) => (
                  <div key={i} style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.375rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {v.colorHex && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.colorHex, border: '1px solid #E2E8F0', display: 'inline-block' }} />}
                    <span>{v.size} / {v.color || '—'} — AED {v.priceAed} ({v.stockQty} pcs)</span>
                  </div>
                ))}
              </div>
            </div>

            {images.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Images ({images.length})</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {images.map((url, i) => (
                    <img key={i} src={url} alt="" style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(3)} className="btn btn-ghost">Back</button>
              <button onClick={submit} disabled={loading} className="btn btn-primary btn-lg">
                {loading ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
