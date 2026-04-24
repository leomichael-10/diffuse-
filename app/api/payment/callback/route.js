import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '../../../../lib/prisma.js'

function verifyHmac(body, receivedHmac) {
  const secret = process.env.PAYMOB_HMAC_SECRET
  if (!secret) return true // skip verification if not configured

  // Paymob HMAC: concatenate specific fields in alphabetical order
  const fields = [
    'amount_cents', 'created_at', 'currency', 'error_occured',
    'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
    'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
    'is_voided', 'order', 'owner', 'pending', 'source_data_pan',
    'source_data_sub_type', 'source_data_type', 'success',
  ]

  const txn = body.obj || {}
  const concatenated = fields.map(f => {
    if (f === 'order')       return txn.order?.id ?? ''
    if (f === 'source_data_pan')      return txn.source_data?.pan ?? ''
    if (f === 'source_data_sub_type') return txn.source_data?.sub_type ?? ''
    if (f === 'source_data_type')     return txn.source_data?.type ?? ''
    return txn[f] ?? ''
  }).join('')

  const hmac = crypto
    .createHmac('sha512', secret)
    .update(concatenated)
    .digest('hex')

  return hmac === receivedHmac
}

export async function POST(request) {
  try {
    const body  = await request.json()
    const hmac  = request.nextUrl.searchParams.get('hmac') || body.hmac

    if (!verifyHmac(body, hmac)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const txn        = body.obj
    const success    = txn?.success === true
    const paymobOId  = String(txn?.order?.id || '')

    if (!paymobOId) return NextResponse.json({ success: true })

    const order = await prisma.order.findFirst({ where: { paymobOrderId: paymobOId } })
    if (!order) return NextResponse.json({ success: true })

    if (success) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { paymentStatus: 'paid', status: 'confirmed' },
      })
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data:  { paymentStatus: 'failed' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Paymob callback error:', err)
    return NextResponse.json({ success: true }) // always 200 to Paymob
  }
}

// Paymob also sends GET callback for redirect
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const success     = searchParams.get('success') === 'true'
  const merchantRef = searchParams.get('merchant_order_id')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (success) {
    return NextResponse.redirect(`${baseUrl}/orders?payment=success`)
  }
  return NextResponse.redirect(`${baseUrl}/cart?payment=failed`)
}
