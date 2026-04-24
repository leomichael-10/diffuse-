import { SignJWT, jwtVerify } from 'jose'

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

export function cookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return `token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}
