import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const gender     = searchParams.get('gender')
  const search     = searchParams.get('search')
  const minPrice   = searchParams.get('minPrice')
  const maxPrice   = searchParams.get('maxPrice')
  const featured   = searchParams.get('featured')
  const limit      = Number(searchParams.get('limit')) || 60
  const page       = Number(searchParams.get('page'))  || 1

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(featured === 'true' && { isFeatured: true }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(gender     && { gender }),
      ...(search     && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { brand:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice || maxPrice ? {
        variants: {
          some: {
            priceAed: {
              ...(minPrice && { gte: Number(minPrice) }),
              ...(maxPrice && { lte: Number(maxPrice) }),
            },
          },
        },
      } : {}),
    },
    include: {
      category: true,
      images:   { orderBy: { sortOrder: 'asc' }, take: 2 },
      variants: { orderBy: { priceAed: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
    take:    limit,
    skip:    (page - 1) * limit,
  })

  return NextResponse.json(products)
}

export async function POST(request) {
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { name, brand, description, categoryId, gender, season, variants, imageUrls, isFeatured } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    if (!variants?.length) return NextResponse.json({ error: 'At least one variant is required' }, { status: 400 })

    const product = await prisma.product.create({
      data: {
        name:        name.trim(),
        brand:       brand?.trim()       || 'Diffuse',
        description: description?.trim() || null,
        categoryId:  categoryId ? Number(categoryId) : null,
        gender:      gender    || null,
        season:      season    || null,
        isFeatured:  isFeatured || false,
        variants: {
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
        images: imageUrls?.length ? {
          create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
        } : undefined,
      },
      include: { variants: true, images: true, category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error('Create product error:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
