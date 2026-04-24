import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET() {
  const sellers = await prisma.seller.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, isBanned: true } },
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sellers)
}
