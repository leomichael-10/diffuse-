'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../../components/Navbar.js'
import ImageDropzone from '../../../../components/ImageDropzone.js'

function VariantImageUpload({ image, onChange }) {
  const [uploading, setUploading] = useState(false)
  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.urls?.[0]) onChange(data.urls[0])
    } finally { setUploading(false) }
  }
  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Variant Image</span>
      {image && <img src={image} alt="" style={{ width: 40, height: 48, objectFit: 'cover', border: '1px solid #E2E8F0', borderRadius: 4 }} />}
      <label style={{ cursor: 'pointer', fontSize: '0.75rem', color: '#6366F1', textDecoration: 'underline' }}>
        {uploading ? 'Uploading…' : image ? 'Change' : 'Upload photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
      {image && <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#EF4444', fontFamily: 'inherit' }}>Remove</button>}
    </div>
  )
}

const SIZES   = ['XS','S','M','L','XL','XXL','28','30','32','34','36','38','40','42','One Size']
const GENDERS = ['Men','Women','Unisex','Kids']
const SEASONS = ['All Season','Summer','Winter','Spring/Autumn']

function emptyVariant(i) {
  return { id: i, size: 'M', color: '', colorHex: '#000000', material: '', priceAed: '', stockQty: '', skuCode: '', image: '' }
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
  const [variants,  setVariants]  = useState([emptyVariant(0)])
  const [images,    setImages]    = useState([])  // Cloudinary URLs

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!user || user.role !== 'seller') { router.push('/login'); return }
    fetch('/api/categories')
      .then(r => r.json())
      .then(cats => setCategories(cats.flatMap(c => [c, ...(c.children || [])])))
      .catch(() => {})
  }, [router])

  function setDetail(k, v) { setDetails(p => ({ ...p, [k]: v })) }
  function addVariant() { setVariants(p => [...p, emptyVariant(p.length)]) }
  function removeVariant(i) { setVariants(p => p.filter((_, idx) => idx !== i)) }
  function setVariantField(i, key, val) { setVariants(p => p.map((v, idx) => idx === i ? { ...v, [key]: val } : v)) }

  function autoSku(v, i) {
    const brand = details.brand?.slice(0, 4).toUpperCase() || 'PRD'
    const size  = (v.size  || 'XX').toUpperCase()
    const color = (v.color || 'XX').slice(0, 3).toUpperCase()
    return `${brand}-${size}-${color}-${i + 1}`
  }

  async function submit() {
    if (!details.name.trim())              { setError('Product name is required'); return }
    if (variants.some(v => !v.priceAed))   { setError('All variants must have a price'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...details,
          categoryId: details.categoryId || null,
          imageUrls:  images,
          variants:   variants.map((v, i) => ({
            ...v,
            skuCode:  v.skuCode || autoSku(v, i),
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

  const STEPS = ['Product Details', 'Images', 'Variants', 'Review & Submit']

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <a href="/dashboard/products" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>← Products</a>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600 }}>Add New Product</h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '2rem', borderBottom: '2px solid #E2E8F0' }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => step > i + 1 && setStep(i + 1)} style={{
              padding: '0.75rem 1.25rem', border: 'none', background: 'none',
              cursor: step > i + 1 ? 'pointer' : 'default',
              fontWeight: step === i + 1 ? 600 : 400,
              color: step === i + 1 ? '#111' : step > i + 1 ? '#334155' : '#94A3B8',
              borderBottom: `2px solid ${step === i + 1 ? '#111' : 'transparent'}`,
              marginBottom: '-2px', fontSize: '0.875rem', fontFamily: 'inherit',
            }}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#c62828', padding: '0.875rem 1rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {/* ── Step 1: Product Details ── */}
        {step === 1 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.05rem' }}>Product Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Product Name *</label>
                <input className="input" value={details.name} onChange={e => setDetail('name', e.target.value)} placeholder="Classic White Tee" />
              </div>
              <div>
                <label className="label">Brand</label>
                <input className="input" value={details.brand} onChange={e => setDetail('brand', e.target.value)} placeholder="Diffuse" />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={details.categoryId} onChange={e => setDetail('categoryId', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.parentId ? '  — ' : ''}{c.name}</option>)}
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
                <textarea className="input" rows={3} value={details.description} onChange={e => setDetail('description', e.target.value)} placeholder="Describe the product..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { if (!details.name.trim()) { setError('Product name required'); return } setError(''); setStep(2) }}
                className="btn btn-black btn-sm"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                Next: Images
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Images ── */}
        {step === 2 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '0.375rem', fontSize: '1.05rem' }}>Upload Product Images</h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.75rem' }}>
              Upload up to 5 images. The first image will be shown as the main product photo. Accepted formats: JPG, PNG, WebP.
            </p>

            <ImageDropzone images={images} onChange={setImages} max={5} />

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline btn-sm" style={{ padding: '0.75rem 1.5rem' }}>Back</button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {images.length === 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>No images yet — you can add them later</span>
                )}
                <button onClick={() => setStep(3)} className="btn btn-black btn-sm" style={{ padding: '0.75rem 1.75rem' }}>
                  Next: Variants
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Variants ── */}
        {step === 3 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '0.375rem', fontSize: '1.05rem' }}>Variants</h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Add a variant for each size/colour combination. At minimum, set a price and stock quantity.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {variants.map((v, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Variant {i + 1}</span>
                    {variants.length > 1 && (
                      <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
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
                      <input className="input" value={v.color} onChange={e => setVariantField(i, 'color', e.target.value)} placeholder="White" />
                    </div>
                    <div>
                      <label className="label">Color</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="color" value={v.colorHex} onChange={e => setVariantField(i, 'colorHex', e.target.value)}
                          style={{ width: '38px', height: '36px', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
                        <input className="input" value={v.colorHex} onChange={e => setVariantField(i, 'colorHex', e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Material</label>
                      <input className="input" value={v.material} onChange={e => setVariantField(i, 'material', e.target.value)} placeholder="100% Cotton" />
                    </div>
                    <div>
                      <label className="label">Price (EGP) *</label>
                      <input type="number" className="input" value={v.priceAed} onChange={e => setVariantField(i, 'priceAed', e.target.value)} placeholder="299" min="0" />
                    </div>
                    <div>
                      <label className="label">Stock Qty</label>
                      <input type="number" className="input" value={v.stockQty} onChange={e => setVariantField(i, 'stockQty', e.target.value)} placeholder="50" min="0" />
                    </div>
                    <div>
                      <label className="label">SKU (auto if blank)</label>
                      <input className="input" value={v.skuCode} onChange={e => setVariantField(i, 'skuCode', e.target.value)} placeholder={autoSku(v, i)} />
                    </div>
                  </div>
                  <VariantImageUpload image={v.image || ''} onChange={url => setVariantField(i, 'image', url)} />
                </div>
              ))}
            </div>
            <button onClick={addVariant} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', border: '1px dashed #CBD5E1', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#64748B', fontFamily: 'inherit' }}>
              + Add Another Variant
            </button>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn btn-outline btn-sm" style={{ padding: '0.75rem 1.5rem' }}>Back</button>
              <button
                onClick={() => { if (variants.some(v => !v.priceAed)) { setError('All variants need a price'); return } setError(''); setStep(4) }}
                className="btn btn-black btn-sm"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Submit ── */}
        {step === 4 && (
          <div className="card">
            <h2 style={{ fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.05rem' }}>Review & Submit</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              {/* Details */}
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: '0.875rem' }}>Product Details</h3>
                <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Name',    details.name],
                      ['Brand',   details.brand   || '—'],
                      ['Gender',  details.gender],
                      ['Season',  details.season],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ color: '#64748B', padding: '0.3rem 0.5rem 0.3rem 0', whiteSpace: 'nowrap' }}>{k}</td>
                        <td style={{ fontWeight: 500 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Variants */}
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: '0.875rem' }}>
                  Variants ({variants.length})
                </h3>
                {variants.map((v, i) => (
                  <div key={i} style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.375rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {v.colorHex && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.colorHex, border: '1px solid #E2E8F0', flexShrink: 0 }} />}
                    <span>{v.size} / {v.color || '—'} — EGP {v.priceAed} ({v.stockQty || 0} units)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Images preview */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: '0.875rem' }}>
                Images ({images.length})
              </h3>
              {images.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {images.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: '72px', height: '90px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                      {i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.55rem', textAlign: 'center', padding: '2px', letterSpacing: '0.1em' }}>MAIN</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>No images — product will show a placeholder.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(3)} className="btn btn-outline btn-sm" style={{ padding: '0.75rem 1.5rem' }}>Back</button>
              <button onClick={submit} disabled={loading} className="btn btn-black btn-sm" style={{ padding: '0.875rem 2rem', fontSize: '0.78rem', letterSpacing: '0.12em' }}>
                {loading ? 'Publishing…' : 'Publish Product'}
              </button>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
