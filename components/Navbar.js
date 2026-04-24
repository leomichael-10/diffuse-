'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar({ isAdmin = false }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [user,        setUser]        = useState(null)
  const [cartCount,   setCartCount]   = useState(0)
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    try {
      const s = localStorage.getItem('diffuse_user')
      setUser(s ? JSON.parse(s) : null)
    } catch { setUser(null) }
  }, [pathname])

  useEffect(() => {
    function update() {
      try {
        const cart = JSON.parse(localStorage.getItem('diffuse_cart') || '[]')
        setCartCount(cart.reduce((s, i) => s + (i.quantity || i.qty || 1), 0))
      } catch {}
    }
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  // iOS-safe scroll lock: store scroll position and use position:fixed
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem('diffuse_user')
    localStorage.removeItem('diffuse_cart')
    window.dispatchEvent(new Event('cart-updated'))
    setMenuOpen(false)
    router.push('/')
  }

  function submitSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchOpen(false)
    setSearchQuery('')
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const navCls = isAdmin
    ? 'nav opaque admin-nav'
    : `nav${scrolled || menuOpen ? ' scrolled' : ''}`

  if (isAdmin) {
    return (
      <header className={navCls}>
        <div className="nav-inner">
          <Link href="/admin" className="nav-logo" style={{ color: 'rgba(255,255,255,0.9)' }}>Diffuse</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: '0.75rem' }}>Admin</span>
            <Link href="/" style={{ fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
              View Site
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={logout} className="nav-icon-btn" style={{ color: 'rgba(255,255,255,0.5)' }}>Logout</button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className={navCls} style={{ zIndex: 300 }}>
        <div className="nav-inner">
          {/* Left */}
          <nav className="nav-links hide-mobile">
            {[
              ['/products',              'Shop'],
              ['/products?sort=new',     'New In'],
              ['/products?gender=Men',   'Men'],
              ['/products?gender=Women', 'Women'],
            ].map(([href, label]) => (
              <Link key={href} href={href}
                className={`nav-link${pathname === href ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Center */}
          <div style={{ textAlign: 'center' }}>
            <Link href="/" className="nav-logo">Diffuse</Link>
          </div>

          {/* Right */}
          <div className="nav-actions">
            {/* Search — desktop only */}
            {searchOpen ? (
              <form onSubmit={submitSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  style={{
                    border: 'none', borderBottom: '1px solid var(--black)',
                    background: 'transparent', outline: 'none',
                    fontFamily: 'inherit', fontSize: '0.72rem',
                    letterSpacing: '0.04em', width: '140px',
                    padding: '0.2rem 0', color: 'var(--black)',
                  }}
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '1rem', lineHeight: 1, padding: '0.25rem' }}>
                  ×
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="nav-icon-btn hide-mobile" aria-label="Search">
                <SearchIcon />
              </button>
            )}

            {/* Auth links — desktop */}
            {!user ? (
              <Link href="/login" className="nav-link hide-mobile">Sign In</Link>
            ) : (
              <div className="hide-mobile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {user.role === 'admin' ? (
                  <Link href="/admin" className="nav-link">Admin</Link>
                ) : (
                  <>
                    <Link href="/wishlist" className="nav-link">Wishlist</Link>
                    <Link href="/account"  className="nav-link">Account</Link>
                  </>
                )}
                <button onClick={logout} className="nav-icon-btn">Logout</button>
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--black)', transition: 'opacity 0.2s', padding: '0.25rem 0' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <CartIcon />
              {cartCount > 0 && (
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.06em', lineHeight: 1 }}>
                  ({cartCount})
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="show-mobile nav-icon-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{ padding: '0.5rem', margin: '-0.5rem -0.25rem -0.5rem 0' }}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — rendered outside header so z-index stacking is clean */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 290,
            background: 'var(--white)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>

          {/* Spacer for nav height */}
          <div style={{ flexShrink: 0, height: 'var(--nav-height)' }} />

          {/* Mobile search */}
          <form onSubmit={e => { submitSearch(e); setMenuOpen(false) }}
            style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', flexShrink: 0 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              style={{
                width: '100%', border: 'none', borderBottom: '1px solid var(--gray-300)',
                background: 'transparent', outline: 'none', fontFamily: 'inherit',
                fontSize: '1rem', padding: '0.5rem 0', color: 'var(--black)',
              }}
            />
          </form>

          {/* Nav links */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2.5rem 1.5rem', gap: '2rem' }}>
            {[
              ['/products',              'Shop'],
              ['/products?sort=new',     'New In'],
              ['/products?gender=Men',   'Men'],
              ['/products?gender=Women', 'Women'],
            ].map(([href, label]) => (
              <Link key={href} href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                  color: 'var(--black)',
                  display: 'block',
                  padding: '0.25rem 0',
                }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Account links */}
          <div style={{ borderTop: '1px solid var(--gray-300)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
            {!user ? (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="nav-link">Sign In</Link>
            ) : (
              <>
                {user.role !== 'admin' && (
                  <>
                    <Link href="/account"  onClick={() => setMenuOpen(false)} className="nav-link">Account</Link>
                    <Link href="/orders"   onClick={() => setMenuOpen(false)} className="nav-link">My Orders</Link>
                    <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="nav-link">Wishlist</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="nav-link">Admin</Link>
                )}
                <button onClick={logout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'inherit' }}
                  className="nav-link">
                  Sign Out
                </button>
              </>
            )}
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="nav-link"
              style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
              Bag {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="17" x2="21" y2="17"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
