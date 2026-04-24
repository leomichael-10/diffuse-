import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const productId = Number(searchParams.get('productId'))

  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const reviews = await prisma.review.findMany({
    where:   { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take:    50,
  })

  const data = JSON.parse(JSON.stringify(reviews))

  const avg = data.length
    ? Math.round((data.reduce((s, r) => s + r.rating, 0) / data.length) * 10) / 10
    : 0

  return NextResponse.json({ reviews: data, avg, count: data.length })
}

export async function POST(request) {
  const userId    = Number(request.headers.get('x-user-id'))
  const { productId, rating, body } = await request.json()

  if (!userId)    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })
  }

  // Verify user has a delivered order containing this product
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: 'delivered',
      items: {
        some: {
          variant: { productId: Number(productId) },
        },
      },
    },
  })

  if (!deliveredOrder) {
    return NextResponse.json({ error: 'You can only review products from delivered orders' }, { status: 403 })
  }

  try {
    const review = await prisma.review.upsert({
      where:  { userId_productId: { userId, productId: Number(productId) } },
      update: { rating, body: body?.trim() || null },
      create: { userId, productId: Number(productId), rating, body: body?.trim() || null },
      include: { user: { select: { name: true } } },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(review)))
  } catch {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const userId = Number(request.headers.get('x-user-id'))
  const { reviewId } = await request.json()

  const review = await prisma.review.findUnique({ where: { id: Number(reviewId) } })
  if (!review || review.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.review.delete({ where: { id: Number(reviewId) } })
  return NextResponse.json({ success: true })
}
