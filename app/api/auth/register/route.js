import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma.js'
import { signToken } from '../../../../lib/auth.js'

export async function POST(request) {
  try {
    const { email, password, name, phone, city } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email:    email.toLowerCase().trim(),
        password: hashedPassword,
        name:     name?.trim()  || null,
        phone:    phone?.trim() || null,
        city:     city?.trim()  || null,
        role:     'buyer',
      },
    })

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, isBanned: false })

    const response = NextResponse.json(
      { token, role: user.role, name: user.name, email: user.email },
      { status: 201 }
    )
    response.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })

    return response
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
