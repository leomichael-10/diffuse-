import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request) {
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status  = searchParams.get('status')
  const search  = searchParams.get('search')?.trim()

  const where = {}
  if (status) where.status = status

  if (search) {
    const searchNum = Number(search)
    where.OR = [
      ...(isNaN(searchNum) ? [] : [{ id: searchNum }]),
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name:  { contains: search, mode: 'insensitive' } } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user:  { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { name: true, brand: true },
                include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(JSON.parse(JSON.stringify(orders)))
}
