import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET() {
  const users = await prisma.user.findMany({
    where:  { role: 'buyer' },
    select: {
      id: true, email: true, name: true, phone: true, city: true,
      isBanned: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}
