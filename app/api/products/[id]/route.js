import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, icon: true } },
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      images:   { orderBy: { sortOrder: 'asc' } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!product || !product.isActive) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { name, brand, description, categoryId, gender, season, isActive, isFeatured, variants, imageUrls } = body

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name:        name?.trim()        ?? product.name,
      brand:       brand?.trim()       ?? product.brand,
      description: description?.trim() ?? product.description,
      categoryId:  categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : product.categoryId,
      gender:      gender    !== undefined ? gender    : product.gender,
      season:      season    !== undefined ? season    : product.season,
      isActive:    isActive  !== undefined ? isActive  : product.isActive,
      isFeatured:  isFeatured !== undefined ? isFeatured : product.isFeatured,
      ...(variants && {
        variants: {
          deleteMany: {},
          create: variants.map(v => ({
            size:     v.size     || null,
            color:    v.color    || null,
            colorHex: v.colorHex || null,
            material: v.material || null,
            priceAed: Number(v.priceAed),
            stockQty: Number(v.stockQty) || 0,
            skuCode:  v.skuCode || null,
          })),
        },
      }),
      ...(imageUrls && {
        images: {
          deleteMany: {},
          create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      }),
    },
    include: { variants: true, images: true, category: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ message: 'Product deleted' })
}
