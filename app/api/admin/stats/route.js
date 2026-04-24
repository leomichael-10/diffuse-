import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET() {
  const [userCount, productCount, orderCount, allOrders, topVariants] = await Promise.all([
    prisma.user.count({ where: { role: 'buyer' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where:  { status: { not: 'cancelled' } },
      select: { totalAed: true, status: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  const totalRevenue  = allOrders.reduce((s, o) => s + Number(o.totalAed), 0)
  const pendingOrders = allOrders.filter(o => o.status === 'pending').length
  const avgOrderValue = allOrders.length ? totalRevenue / allOrders.length : 0

  // Monthly revenue — last 12 months
  const now = new Date()
  const monthlyRevenue = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyRevenue[key] = 0
  }
  allOrders.forEach(o => {
    const d   = new Date(o.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthlyRevenue) monthlyRevenue[key] += Number(o.totalAed)
  })
  const monthlyData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))

  // Order status breakdown
  const statusBreakdown = {}
  allOrders.forEach(o => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1 })

  // Enrich top products
  const topProducts = await Promise.all(
    topVariants.map(async v => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: v.variantId },
        include: { product: { select: { name: true, id: true } } },
      })
      return { productId: variant?.product?.id, name: variant?.product?.name || 'Unknown', unitsSold: v._sum.quantity || 0 }
    })
  )

  // Top products deduplicated by product id
  const seen = new Set()
  const topProductsDeduped = topProducts.filter(p => {
    if (seen.has(p.productId)) return false
    seen.add(p.productId)
    return true
  })

  const recentOrders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      user:  { select: { name: true, email: true } },
      items: { include: { variant: { include: { product: { select: { name: true } } } } } },
    },
  })

  return NextResponse.json({
    userCount,
    productCount,
    orderCount,
    totalRevenue,
    pendingOrders,
    avgOrderValue,
    monthlyData,
    statusBreakdown,
    topProducts: topProductsDeduped,
    recentOrders,
  })
}
