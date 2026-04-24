import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/contact',
  '/api/payment/callback',
]

const OPTIONAL_AUTH_PREFIXES = [
  '/api/products',
  '/api/categories',
  '/api/reviews',
  '/api/shops',
]

const ROLE_RESTRICTED = {
  '/api/admin':   ['admin'],
  '/api/orders':  ['buyer', 'admin'],
  '/api/auth/me': ['buyer', 'admin'],
  '/api/wishlist':['buyer', 'admin'],
  '/api/payment': ['buyer', 'admin'],
}

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'diffuse-secret-key-2024')
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }

  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r))) {
    const res = NextResponse.next()
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : request.cookies.get('token')?.value

  const isOptionalAuth =
    request.method === 'GET' &&
    OPTIONAL_AUTH_PREFIXES.some(p => pathname.startsWith(p))

  if (!token) {
    if (isOptionalAuth) return NextResponse.next()
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let payload
  try {
    const { payload: verified } = await jwtVerify(token, getSecret())
    payload = verified
  } catch {
    if (isOptionalAuth) return NextResponse.next()
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  if (payload.isBanned) {
    return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 })
  }

  for (const [prefix, allowedRoles] of Object.entries(ROLE_RESTRICTED)) {
    if (pathname.startsWith(prefix) && !allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id',    String(payload.userId))
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role',  payload.role)

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

export const config = {
  matcher: ['/api/:path*'],
}
