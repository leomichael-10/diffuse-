'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router  = useRouter()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', phone: '', city: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }

      localStorage.setItem('diffuse_user', JSON.stringify({ role: data.role, name: data.name, email: data.email }))
      router.push('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',     label: 'Full Name',          type: 'text',     placeholder: 'Jane Smith',        required: true },
    { key: 'email',    label: 'Email',               type: 'email',    placeholder: 'your@email.com',    required: true },
    { key: 'password', label: 'Password',            type: 'password', placeholder: 'Min. 6 characters', required: true },
    { key: 'phone',    label: 'Phone (optional)',    type: 'tel',      placeholder: '+20 10 0000 0000',  required: false },
    { key: 'city',     label: 'City (optional)',     type: 'text',     placeholder: 'Cairo',             required: false },
  ]

  return (
    <div className="auth-layout" style={{ background: 'var(--white)' }}>

      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="auth-panel-deco" style={{
        background: 'var(--black)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3rem, 5vw, 4.5rem)',
            fontWeight: 200,
            letterSpacing: '0.25em',
            color: 'var(--white)',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '2rem',
          }}>
            Diffuse
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.04em',
            marginBottom: '3rem',
          }}>
            Wear the Difference
          </p>
          <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 3rem' }} />
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Free to join
          </p>
        </div>
        <div style={{ position: 'absolute', inset: '3rem', border: '1px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem)',
        minHeight: '100dvh',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <Link href="/" style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: 'var(--black)',
            }}>
              Diffuse
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Join Diffuse</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 300,
              letterSpacing: '0.02em',
              color: 'var(--black)',
            }}>
              Create Account
            </h1>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
            {fields.map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input
                  type={f.type}
                  className="input-line"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setField(f.key, e.target.value)}
                  required={f.required}
                  style={{ fontSize: '1rem' }}
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-black btn-full"
              style={{ marginTop: '0.5rem', padding: '1.1rem', fontSize: '0.65rem', letterSpacing: '0.2em' }}
              disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '1px' }}>
              Sign in
            </Link>
          </p>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray-400)' }}
              onMouseEnter={e => e.target.style.color = 'var(--black)'}
              onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
