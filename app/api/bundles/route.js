import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma.js'

export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(bundles)))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, description, imageUrl, priceAed, items } = await request.json()
    if (!name || !priceAed) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const bundle = await prisma.bundle.create({
      data: {
        name,
        description,
        imageUrl,
        priceAed,
        items: items?.length
          ? { create: items.map(i => ({ variantId: i.variantId, quantity: i.quantity || 1 })) }
          : undefined,
      },
      include: { items: true },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(bundle)), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
