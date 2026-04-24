import { NextResponse } from 'next/server'
import { jwtVerify }   from 'jose'
import { hash, compare } from 'bcryptjs'
import prisma from '../../../../lib/prisma.js'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'diffuse-secret-key-2026')

async function getUserId(request) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId
  } catch { return null }
}

export async function GET(request) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, name: true, role: true, city: true, phone: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(request) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, phone, city, currentPassword, newPassword } = body

  // Password change
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const valid = await compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    const hashed = await hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
    return NextResponse.json({ success: true })
  }

  // Profile update
  const updated = await prisma.user.update({
    where:  { id: userId },
    data:   { name: name || undefined, phone: phone || undefined, city: city || undefined },
    select: { id: true, email: true, name: true, role: true, city: true, phone: true },
  })
  return NextResponse.json(updated)
}
