'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

/**
 * Drag-and-drop image uploader connected to /api/upload → Cloudinary.
 *
 * Props:
 *   images     – string[] of current Cloudinary URLs
 *   onChange   – (urls: string[]) => void  called with updated list
 *   max        – max number of images (default 5)
 */
export default function ImageDropzone({ images = [], onChange, max = 5 }) {
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  const remaining = max - images.length

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return
    const files = accepted.slice(0, remaining)
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      onChange([...images, ...data.urls])
    } catch {
      setError('Upload failed — check your connection')
    } finally {
      setUploading(false)
    }
  }, [images, remaining, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    disabled: uploading || remaining <= 0,
    multiple: true,
  })

  function remove(idx) {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div>
      {/* Drop zone */}
      {remaining > 0 && (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--black)' : 'var(--gray-300)'}`,
            borderRadius: '2px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: isDragActive ? 'var(--gray-100)' : 'var(--white)',
            transition: 'border-color 0.2s, background 0.2s',
            marginBottom: '1.25rem',
          }}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              {/* Spinner */}
              <div style={{
                width: '28px', height: '28px', border: '2px solid var(--gray-200)',
                borderTopColor: 'var(--black)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', letterSpacing: '0.04em' }}>
                Uploading…
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
              {/* Upload icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-400)' }}>
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--black)', fontWeight: 500 }}>
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                  or <span style={{ color: 'var(--black)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>browse files</span>
                </p>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--gray-400)', letterSpacing: '0.04em', marginTop: '0.125rem' }}>
                JPG, PNG or WebP · up to 5 MB each · {remaining} slot{remaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontSize: '0.72rem', color: '#c62828', marginBottom: '0.875rem' }}>{error}</p>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {images.map((url, i) => (
            <div key={url + i} style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                style={{
                  width: '96px', height: '120px', objectFit: 'cover',
                  border: i === 0 ? '2px solid var(--black)' : '1px solid var(--gray-200)',
                  display: 'block',
                }}
              />
              {i === 0 && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                  textAlign: 'center', padding: '3px 0',
                }}>
                  Main
                </div>
              )}
              <button
                onClick={() => remove(i)}
                title="Remove image"
                style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'var(--black)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
