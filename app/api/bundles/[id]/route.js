import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const bundle = await prisma.bundle.findUnique({
      where: { id: Number(id) },
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
    })
    if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(JSON.parse(JSON.stringify(bundle)))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { name, description, imageUrl, priceAed, isActive, items } = await request.json()

    await prisma.bundleItem.deleteMany({ where: { bundleId: Number(id) } })

    const bundle = await prisma.bundle.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(priceAed !== undefined && { priceAed }),
        ...(isActive !== undefined && { isActive }),
        ...(items?.length && {
          items: { create: items.map(i => ({ variantId: i.variantId, quantity: i.quantity || 1 })) },
        }),
      },
      include: { items: true },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(bundle)))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.bundle.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
