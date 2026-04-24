'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar.js'

function ResetForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token')

  const [form,    setForm]    = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Reset failed'); return }
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="btn btn-outline btn-sm">Request New Link</Link>
      </div>
    )
  }

  return done ? (
    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--gray-100)' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--black)', lineHeight: 1.7, marginBottom: '0.5rem' }}>Password changed successfully.</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Redirecting to sign in…</p>
    </div>
  ) : (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div style={{ padding: '0.875rem', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.78rem', color: '#B91C1C' }}>
          {error}
        </div>
      )}
      <div>
        <label className="label">New Password</label>
        <input type="password" className="input-line" required style={{ fontSize: '1rem' }}
          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
      </div>
      <div>
        <label className="label">Confirm Password</label>
        <input type="password" className="input-line" required style={{ fontSize: '1rem' }}
          value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
      </div>
      <button type="submit" className="btn btn-black btn-full" disabled={loading}
        style={{ padding: '1rem', fontSize: '0.62rem', letterSpacing: '0.18em' }}>
        {loading ? 'Saving…' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <div className="page-body" style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <p className="t-label" style={{ marginBottom: '1rem', textAlign: 'center' }}>Account</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.03em', textAlign: 'center', marginBottom: '2.5rem' }}>
            New Password
          </h1>
          <Suspense fallback={<div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)' }}>Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </>
  )
}
