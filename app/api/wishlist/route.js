import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import prisma from '../../../lib/prisma.js'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'diffuse-secret-key-2024')

async function getUserId(request) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId
  } catch { return null }
}

export async function GET(request) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images:   { orderBy: { sortOrder: 'asc' }, take: 2 },
          variants: { orderBy: { priceAed: 'asc' }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await request.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId: Number(productId) } },
  })

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
    return NextResponse.json({ added: false })
  }

  await prisma.wishlistItem.create({ data: { userId, productId: Number(productId) } })
  return NextResponse.json({ added: true })
}

export async function DELETE(request) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await request.json()
  await prisma.wishlistItem.deleteMany({ where: { userId, productId: Number(productId) } })
  return NextResponse.json({ success: true })
}
