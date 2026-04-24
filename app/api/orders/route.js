import { NextResponse } from 'next/server'
import { createTransport } from 'nodemailer'
import prisma from '../../../lib/prisma.js'

const DELIVERY_THRESHOLD = 500 // EGP
const DELIVERY_FEE       = 50  // EGP

const transporter = createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   587,
  secure: false,
  tls:    { rejectUnauthorized: false },
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

function fmt(n) { return `EGP ${Number(n).toLocaleString('en-EG')}` }

function orderEmailHtml({ order, items, variants, subtotal, deliveryFee, total, deliveryAddress, paymentMethod }) {
  const methodLabel = {
    cash_on_delivery: 'Cash on Delivery',
    mobile_wallet:    'Mobile Wallet',
    card:             'Card Payment',
  }[paymentMethod] || paymentMethod

  const rows = items.map(item => {
    const v    = variants.find(v => v.id === Number(item.variantId))
    const name = v?.product?.name || 'Product'
    const size = v?.size  ? ` — ${v.size}`  : ''
    const clr  = v?.color ? ` / ${v.color}` : ''
    const line = Number(v?.priceAed || 0) * item.quantity
    return `<tr>
      <td style="padding:0.6rem 0;border-bottom:1px solid #eee;font-size:0.85rem;">${name}${size}${clr}</td>
      <td style="padding:0.6rem 0;border-bottom:1px solid #eee;font-size:0.85rem;text-align:center;">${item.quantity}</td>
      <td style="padding:0.6rem 0;border-bottom:1px solid #eee;font-size:0.85rem;text-align:right;">${fmt(line)}</td>
    </tr>`
  }).join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;padding:2rem;">
      <div style="text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #eee;">
        <p style="font-size:1.4rem;font-weight:300;letter-spacing:0.2em;text-transform:uppercase;margin:0;">Diffuse</p>
        <p style="font-size:0.75rem;color:#888;margin:0.5rem 0 0;">Order Confirmation</p>
      </div>
      <p style="font-size:0.85rem;color:#555;margin-bottom:1.5rem;">
        Thank you for your order. We'll start preparing it right away.
      </p>
      <p style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin-bottom:0.5rem;">Order #${order.id}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">
        <thead>
          <tr style="border-bottom:2px solid #111;">
            <th style="padding:0.5rem 0;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;text-align:left;font-weight:500;">Item</th>
            <th style="padding:0.5rem 0;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;text-align:center;font-weight:500;">Qty</th>
            <th style="padding:0.5rem 0;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;text-align:right;font-weight:500;">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;font-size:0.85rem;margin-bottom:2rem;">
        <tr><td style="padding:0.35rem 0;color:#555;">Subtotal</td><td style="text-align:right;">${fmt(subtotal)}</td></tr>
        <tr><td style="padding:0.35rem 0;color:#555;">Delivery</td><td style="text-align:right;">${deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</td></tr>
        <tr style="border-top:1px solid #eee;">
          <td style="padding:0.6rem 0 0;font-weight:600;">Total</td>
          <td style="padding:0.6rem 0 0;text-align:right;font-weight:600;">${fmt(total)}</td>
        </tr>
      </table>
      <div style="display:flex;gap:1.5rem;margin-bottom:2rem;">
        <div style="flex:1;">
          <p style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin:0 0 0.4rem;">Delivery Address</p>
          <p style="font-size:0.85rem;line-height:1.6;margin:0;">${deliveryAddress}</p>
        </div>
        <div style="flex:1;">
          <p style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin:0 0 0.4rem;">Payment</p>
          <p style="font-size:0.85rem;margin:0;">${methodLabel}</p>
        </div>
      </div>
      <div style="text-align:center;padding-top:1.5rem;border-top:1px solid #eee;">
        <p style="font-size:0.75rem;color:#888;">Questions? Email us at <a href="mailto:hello@diffuse.eg" style="color:#111;">hello@diffuse.eg</a></p>
      </div>
    </div>
  `
}

async function sendOrderEmails({ order, items, variants, subtotal, deliveryFee, total, deliveryAddress, paymentMethod, customerEmail, customerName }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return

  const html = orderEmailHtml({ order, items, variants, subtotal, deliveryFee, total, deliveryAddress, paymentMethod })
  const from  = `"Diffuse Egypt" <${process.env.SMTP_USER}>`

  await Promise.allSettled([
    // Customer confirmation
    transporter.sendMail({
      from,
      to:      customerEmail,
      subject: `Order Confirmed — #${order.id} | Diffuse`,
      html,
    }),
    // Admin notification
    transporter.sendMail({
      from,
      to:      process.env.ADMIN_EMAIL || 'hello@diffuse.eg',
      subject: `New Order #${order.id} from ${customerName || customerEmail}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;padding:2rem;">
          <p style="font-size:1rem;font-weight:600;margin-bottom:1rem;">New Order Received</p>
          <p style="font-size:0.85rem;color:#555;">
            <strong>${customerName || '—'}</strong> (${customerEmail}) placed order
            <strong>#${order.id}</strong> for <strong>${fmt(total)}</strong>.
          </p>
          ${html}
        </div>
      `,
    }),
  ])
}

export async function GET(request) {
  const role   = request.headers.get('x-user-role')
  const userId = Number(request.headers.get('x-user-id'))

  if (role === 'admin') {
    const orders = await prisma.order.findMany({
      include: {
        user:  { select: { name: true, email: true, phone: true } },
        items: { include: { variant: { include: { product: { select: { name: true, brand: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(orders)))
  }

  const orders = await prisma.order.findMany({
    where:   { userId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(JSON.parse(JSON.stringify(orders)))
}

export async function POST(request) {
  const userId = Number(request.headers.get('x-user-id'))
  const role   = request.headers.get('x-user-role')

  if (role !== 'buyer') {
    return NextResponse.json({ error: 'Only customers can place orders' }, { status: 403 })
  }

  try {
    const { items, deliveryAddress, paymentMethod, notes } = await request.json()

    if (!items?.length)            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!deliveryAddress?.trim())  return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })

    const variantIds = items.map(i => Number(i.variantId))
    const [variants, customer] = await Promise.all([
      prisma.productVariant.findMany({
        where:   { id: { in: variantIds } },
        include: { product: { select: { name: true } } },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ])

    for (const item of items) {
      const v = variants.find(v => v.id === Number(item.variantId))
      if (!v) return NextResponse.json({ error: 'Item not found' }, { status: 400 })
      if (v.stockQty < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${v.product.name}` }, { status: 400 })
      }
    }

    const subtotal    = items.reduce((sum, item) => {
      const v = variants.find(v => v.id === Number(item.variantId))
      return sum + Number(v.priceAed) * item.quantity
    }, 0)
    const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const total       = subtotal + deliveryFee

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalAed:        total,
          deliveryFeeAed:  deliveryFee,
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod:   paymentMethod || 'cash_on_delivery',
          notes:           notes?.trim() || null,
          items: {
            create: items.map(item => {
              const v = variants.find(v => v.id === Number(item.variantId))
              return { variantId: Number(item.variantId), quantity: item.quantity, priceAed: v.priceAed }
            }),
          },
        },
        include: { items: true },
      })

      for (const item of items) {
        await tx.productVariant.update({
          where: { id: Number(item.variantId) },
          data:  { stockQty: { decrement: item.quantity } },
        })
      }

      return created
    })

    // Send emails (non-blocking — don't fail the order if email fails)
    sendOrderEmails({
      order,
      items,
      variants,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod:   paymentMethod || 'cash_on_delivery',
      customerEmail:   customer?.email || '',
      customerName:    customer?.name  || '',
    }).catch(err => console.error('Order email error:', err))

    return NextResponse.json(JSON.parse(JSON.stringify(order)), { status: 201 })
  } catch (err) {
    console.error('Order error:', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
