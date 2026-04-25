import Link from 'next/link'
import Navbar from '../../components/Navbar.js'

export const metadata = {
  title: 'About Us — Diffuse Egypt',
  description: 'Diffuse was founded in Cairo with one belief: great basics should not compromise on quality or style. Learn our story.',
  openGraph: {
    title:       'About Us — Diffuse Egypt',
    description: 'Our story, our values, and why we believe in quality basics.',
    url:         'https://diffuse-egypt3.vercel.app/about',
  },
  alternates: { canonical: 'https://diffuse-egypt3.vercel.app/about' },
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="page-body">
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Our Story</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              About Diffuse Egypt
            </h1>
          </div>
        </div>

        <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.25rem, 4vw, 3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section" style={{ maxWidth: '720px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 300, lineHeight: 1.7, letterSpacing: '0.02em', color: 'var(--black)', marginBottom: '2rem' }}>
              Diffuse was founded in Cairo with one belief: great basics should not compromise on quality or style.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              We set out to build a clothing brand built for Egypt — its climate, its culture, and its people. Every piece is considered with that in mind: breathable fabrics for warm months, layering pieces for cooler evenings, and silhouettes that work from morning to evening.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.9 }}>
              Our collections are small by design. We release fewer pieces, made better. No excess, no disposable fashion. Just clothing worth keeping.
            </p>
          </div>
        </section>

        <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.25rem, 4vw, 3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '2.5rem' }}>What We Stand For</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'var(--gray-300)' }}>
              {[
                { title: 'Quality', body: 'We source from trusted mills and manufacturers who meet our material standards. Nothing goes to production until it passes our quality review.' },
                { title: 'Simplicity', body: 'Clean lines, considered cuts, no unnecessary detail. We believe restraint is a design principle, not a limitation.' },
                { title: 'Made for Egypt', body: 'Designed with Egypt in mind — our climate, our lifestyle, our aesthetic. Diffuse is a brand that belongs here.' },
              ].map(v => (
                <div key={v.title} style={{ background: 'var(--white)', padding: '2.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.03em', marginBottom: '1rem' }}>{v.title}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: 1.85 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.25rem, 4vw, 3rem)' }}>
          <div className="section" style={{ maxWidth: '560px' }}>
            <p className="t-label" style={{ marginBottom: '1.5rem' }}>Get in Touch</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: 1.9, marginBottom: '2rem' }}>
              Questions, feedback, or wholesale enquiries — we would love to hear from you.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-black btn-sm">Contact Us</Link>
              <Link href="/products" className="btn btn-outline btn-sm">Shop Now</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
