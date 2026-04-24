import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: '#ffffff',
    }}>
      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: 'clamp(5rem, 15vw, 12rem)',
        fontWeight: 300,
        letterSpacing: '0.08em',
        color: '#f0f0f0',
        lineHeight: 1,
        marginBottom: '2rem',
      }}>
        404
      </div>
      <p style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: 'clamp(1.2rem, 3vw, 1.75rem)',
        fontWeight: 300,
        letterSpacing: '0.04em',
        color: '#111111',
        marginBottom: '0.75rem',
      }}>
        This page does not exist
      </p>
      <p style={{
        fontSize: '0.82rem',
        color: '#888',
        letterSpacing: '0.04em',
        marginBottom: '3rem',
      }}>
        The page you are looking for may have been moved or removed.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/products" style={{
          display: 'inline-block',
          background: '#111111',
          color: '#ffffff',
          padding: '0.875rem 2rem',
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}>
          Back to Shop
        </Link>
        <Link href="/" style={{
          display: 'inline-block',
          background: 'none',
          color: '#111111',
          border: '1px solid #111111',
          padding: '0.875rem 2rem',
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          Go Home
        </Link>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        fontFamily: 'var(--font-sans, Inter, sans-serif)',
        fontSize: '0.65rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#ccc',
      }}>
        Diffuse Egypt
      </div>
    </div>
  )
}
