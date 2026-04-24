import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const seller = await prisma.seller.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      products: {
        where: { isActive: true },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: { orderBy: { priceAed: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { products: { where: { isActive: true } } } },
    },
  })

  if (!seller) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  if (!seller.isApproved) return NextResponse.json({ error: 'Shop not available' }, { status: 404 })

  return NextResponse.json(seller)
}
