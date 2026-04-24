import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export async function PATCH(request, { params }) {
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })

  const { status } = await request.json()
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id },
    data:  { status },
    include: {
      user:  { select: { name: true, email: true } },
      items: { include: { variant: { include: { product: { select: { name: true } } } } } },
    },
  })

  return NextResponse.json(JSON.parse(JSON.stringify(order)))
}

export async function GET(request, { params }) {
  const role = request.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId, 10)

  const order = await prisma.order.findUnique({
    where: { id },
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
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(JSON.parse(JSON.stringify(order)))
}
