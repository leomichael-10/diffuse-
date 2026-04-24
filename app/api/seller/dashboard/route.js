import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request) {
  const userId = Number(request.headers.get('x-user-id'))

  const seller = await prisma.seller.findUnique({ where: { userId } })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const [productCount, orders, recentProducts] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id, isActive: true } }),
    prisma.order.findMany({
      where: { items: { some: { variant: { product: { sellerId: seller.id } } } } },
      include: {
        items: { include: { variant: { include: { product: { select: { sellerId: true } } } } } },
      },
    }),
    prisma.product.findMany({
      where: { sellerId: seller.id },
      include: { variants: true, images: { take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totalAed), 0)

  const orderCount = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  return NextResponse.json({
    seller,
    stats: { productCount, orderCount, totalRevenue, pendingOrders },
    recentProducts,
  })
}
