import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const userId = Number(request.headers.get('x-user-id'))
  const role   = request.headers.get('x-user-role')

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user:  { select: { name: true, email: true, phone: true } },
      items: { include: { variant: { include: { product: { select: { name: true, brand: true } } } } } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (role === 'buyer' && order.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(order)
}

export async function PUT(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const role = request.headers.get('x-user-role')

  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status } = await request.json()
  const valid = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const order = await prisma.order.update({ where: { id }, data: { status } })
  return NextResponse.json(order)
}
