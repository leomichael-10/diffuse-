'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router  = useRouter()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Sign in failed'); return }

      localStorage.setItem('diffuse_user', JSON.stringify({ role: data.role, name: data.name, email: data.email }))
      if (data.role === 'admin') router.push('/admin')
      else router.push('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout" style={{ background: 'var(--white)' }}>

      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="auth-panel-deco" style={{
        background: 'var(--gray-100)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        borderRight: '1px solid var(--gray-300)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3rem, 5vw, 5rem)',
            fontWeight: 200,
            letterSpacing: '0.25em',
            color: 'var(--black)',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '2rem',
          }}>
            Diffuse
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            fontWeight: 300,
            color: 'var(--gray-500)',
            letterSpacing: '0.04em',
          }}>
            Wear the Difference
          </p>
        </div>
        <div style={{ position: 'absolute', inset: '3rem', border: '1px solid var(--gray-300)', pointerEvents: 'none' }} />
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem)',
        minHeight: '100dvh',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Logo — always visible, prominent on mobile */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
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
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Welcome back</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 300,
              letterSpacing: '0.02em',
              color: 'var(--black)',
            }}>
              Sign In
            </h1>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.75rem' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-line"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
                style={{ fontSize: '1rem' }}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-line"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
                style={{ fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-black btn-full"
              style={{ marginTop: '0.5rem', padding: '1.1rem', fontSize: '0.65rem', letterSpacing: '0.2em' }}
              disabled={loading}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            <Link href="/forgot-password" style={{ color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-400)', paddingBottom: '1px' }}>
              Forgot password?
            </Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            New to Diffuse?{' '}
            <Link href="/register" style={{ color: 'var(--black)', borderBottom: '1px solid var(--black)', paddingBottom: '1px' }}>
              Create an account
            </Link>
          </p>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
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
