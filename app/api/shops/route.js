import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const search = searchParams.get('search')

  const sellers = await prisma.seller.findMany({
    where: {
      isApproved: true,
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(search && { businessName: { contains: search, mode: 'insensitive' } }),
    },
    include: {
      user: { select: { email: true } },
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: { businessName: 'asc' },
  })

  return NextResponse.json(sellers)
}
