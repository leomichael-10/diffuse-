import { NextResponse } from 'next/server'
import { getFullPaymentUrl } from '../../../../lib/paymob.js'
import prisma from '../../../../lib/prisma.js'

export async function POST(request) {
  const userId = Number(request.headers.get('x-user-id'))
  const role   = request.headers.get('x-user-role')

  if (role !== 'buyer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { orderId, amountEgp, customer, items } = await request.json()

  if (!orderId || !amountEgp || !customer) {
    return NextResponse.json({ error: 'orderId, amountEgp, and customer are required' }, { status: 400 })
  }

  // Verify order belongs to user
  const order = await prisma.order.findFirst({ where: { id: Number(orderId), userId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (!process.env.PAYMOB_API_KEY) {
    return NextResponse.json(
      { error: 'Card payment is not configured yet. Please use Cash on Delivery.' },
      { status: 503 }
    )
  }

  try {
    const { paymentUrl, paymobOrderId } = await getFullPaymentUrl(amountEgp, items || [], customer)

    // Store Paymob order ID for callback verification
    await prisma.order.update({
      where: { id: Number(orderId) },
      data:  { paymobOrderId, paymentStatus: 'pending' },
    })

    return NextResponse.json({ paymentUrl })
  } catch (err) {
    console.error('Paymob error:', err)
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 })
  }
}
