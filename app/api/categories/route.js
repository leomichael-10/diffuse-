import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma.js'

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(request) {
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, slug, parentId, sortOrder } = await request.json()
  const category = await prisma.category.create({
    data: { name, slug, parentId: parentId || null, sortOrder: sortOrder || 0 },
  })
  return NextResponse.json(category, { status: 201 })
}
