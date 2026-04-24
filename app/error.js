'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
      <p style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
        fontWeight: 300,
        letterSpacing: '0.04em',
        color: '#111111',
        marginBottom: '0.75rem',
      }}>
        Something went wrong
      </p>
      <p style={{
        fontSize: '0.8rem',
        color: '#888',
        letterSpacing: '0.03em',
        marginBottom: '3rem',
        maxWidth: '400px',
        lineHeight: 1.7,
      }}>
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            background: '#111111',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            padding: '0.875rem 2rem',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}>
          Try Again
        </button>
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
    </div>
  )
}
