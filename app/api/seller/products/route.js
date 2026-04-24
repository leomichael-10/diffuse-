import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request) {
  const userId = Number(request.headers.get('x-user-id'))

  const seller = await prisma.seller.findUnique({ where: { userId } })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: {
      category: true,
      variants: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}
