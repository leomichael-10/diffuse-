import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '../../../../lib/prisma.js'

export async function POST(request) {
  const { token, password } = await request.json()

  if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
  if (password.length < 6)  return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const user = await prisma.user.findFirst({
    where: {
      resetToken:       token,
      resetTokenExpiry: { gt: new Date() },
    },
  })

  if (!user) return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 })

  const hashed = await hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data:  {
      password:        hashed,
      resetToken:      null,
      resetTokenExpiry: null,
    },
  })

  return NextResponse.json({ success: true })
}
