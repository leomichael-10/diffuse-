'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar.js'

export default function AccountPage() {
  const router = useRouter()
  const [user,    setUser]    = useState(null)
  const [tab,     setTab]     = useState('profile')
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState({ text: '', ok: true })
  const [form,    setForm]    = useState({ name: '', phone: '', city: '' })
  const [pwForm,  setPwForm]  = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('diffuse_user') || 'null')
    if (!u) { router.push('/login?redirect=/account'); return }
    setUser(u)
    setForm({ name: u.name || '', phone: u.phone || '', city: u.city || '' })
  }, [])

  function flash(text, ok = true) { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3500) }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res  = await fetch('/api/auth/me', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { flash(data.error || 'Failed to save', false); return }
      const updated = { ...user, ...form }
      localStorage.setItem('diffuse_user', JSON.stringify(updated))
      setUser(updated)
      flash('Profile updated')
    } catch { flash('Something went wrong', false) }
    finally  { setSaving(false) }
  }

  async function changePassword(e) {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) { flash('Passwords do not match', false); return }
    if (pwForm.next.length < 6) { flash('New password must be at least 6 characters', false); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/auth/me', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await res.json()
      if (!res.ok) { flash(data.error || 'Failed to change password', false); return }
      setPwForm({ current: '', next: '', confirm: '' })
      flash('Password changed')
    } catch { flash('Something went wrong', false) }
    finally  { setSaving(false) }
  }

  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="page-body">
        {/* Header */}
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2.5rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Account</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              {user.name || 'My Account'}
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 3rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem', maxWidth: '860px' }}>

            {/* Sidebar nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { id: 'profile',  label: 'Profile' },
                { id: 'password', label: 'Password' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--gray-200)',
                    fontSize: '0.78rem',
                    color: tab === t.id ? 'var(--black)' : 'var(--gray-500)',
                    fontWeight: tab === t.id ? 500 : 400,
                    letterSpacing: '0.02em',
                  }}>
                  {t.label}
                </button>
              ))}
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/orders" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-500)' }}>
                  My Orders
                </Link>
                <Link href="/wishlist" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-500)' }}>
                  Wishlist
                </Link>
              </div>
            </nav>

            {/* Panel */}
            <div>
              {msg.text && (
                <div style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', background: msg.ok ? 'var(--gray-100)' : '#FEF2F2', border: `1px solid ${msg.ok ? 'var(--gray-300)' : '#FECACA'}`, fontSize: '0.78rem', color: msg.ok ? 'var(--black)' : '#B91C1C', letterSpacing: '0.02em' }}>
                  {msg.text}
                </div>
              )}

              {tab === 'profile' && (
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <div>
                    <p className="t-label" style={{ marginBottom: '1.5rem' }}>Personal Details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <label className="label">Email</label>
                        <input className="input-line" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                        <p style={{ fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '0.4rem' }}>Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="label">Full Name</label>
                        <input className="input-line" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        <input className="input-line" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+20 10 0000 0000" />
                      </div>
                      <div>
                        <label className="label">City</label>
                        <input className="input-line" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Cairo" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="btn btn-black btn-sm" disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {tab === 'password' && (
                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <div>
                    <p className="t-label" style={{ marginBottom: '1.5rem' }}>Change Password</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <label className="label">Current Password</label>
                        <input type="password" className="input-line" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">New Password</label>
                        <input type="password" className="input-line" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">Confirm New Password</label>
                        <input type="password" className="input-line" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
                      </div>
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="btn btn-black btn-sm" disabled={saving}>
                      {saving ? 'Saving…' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
