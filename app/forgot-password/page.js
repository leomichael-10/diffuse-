'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar.js'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-body" style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <p className="t-label" style={{ marginBottom: '1rem', textAlign: 'center' }}>Account</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.03em', textAlign: 'center', marginBottom: '0.75rem' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textAlign: 'center', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Enter the email address linked to your account and we will send a reset link.
          </p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--gray-100)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--black)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.
              </p>
              <Link href="/login" className="btn btn-outline btn-sm">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && (
                <div style={{ padding: '0.875rem', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.78rem', color: '#B91C1C' }}>
                  {error}
                </div>
              )}
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email" className="input-line" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ fontSize: '1rem' }}
                />
              </div>
              <button type="submit" className="btn btn-black btn-full" disabled={loading}
                style={{ padding: '1rem', fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                <Link href="/login" style={{ color: 'var(--black)', borderBottom: '1px solid var(--gray-300)', paddingBottom: '1px' }}>
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
