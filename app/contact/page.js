'use client'

import { useState } from 'react'
import Navbar from '../../components/Navbar.js'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Message sent')
      } else {
        toast.error('Failed to send. Please try again.')
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-body">
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Support</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              Contact Us
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(2rem, 4vw, 4rem) clamp(1.25rem, 4vw, 3rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', maxWidth: '960px', alignItems: 'start' }}>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <p className="t-label" style={{ marginBottom: '1rem' }}>Get in Touch</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: 1.9 }}>
                  We are here to help. Reach us by email, WhatsApp, or use the contact form and we will respond within one business day.
                </p>
              </div>
              {[
                { label: 'Email',    value: 'hello@diffuse.eg' },
                { label: 'Location', value: 'Cairo, Egypt' },
                { label: 'Hours',    value: 'Sunday — Thursday\n9:00am — 6:00pm' },
              ].map(d => (
                <div key={d.label}>
                  <p className="t-label" style={{ marginBottom: '0.5rem' }}>{d.label}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{d.value}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            {sent ? (
              <div style={{ padding: '3rem', background: 'var(--gray-100)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 300, marginBottom: '0.75rem' }}>Message sent</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>We will get back to you within one business day.</p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input-line" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input-line" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input-line" required value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input-line" required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <button type="submit" className="btn btn-black btn-sm" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
