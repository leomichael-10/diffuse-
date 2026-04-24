import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } })

    if (!promo || !promo.isActive)
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })

    if (promo.expiresAt && new Date() > promo.expiresAt)
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 })

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 })

    if (promo.minOrderAed !== null && orderTotal < Number(promo.minOrderAed))
      return NextResponse.json({
        error: `Minimum order of EGP ${Number(promo.minOrderAed).toFixed(0)} required`,
      }, { status: 400 })

    const discount = promo.discountType === 'percent'
      ? Math.round((orderTotal * Number(promo.discountValue)) / 100)
      : Number(promo.discountValue)

    return NextResponse.json({
      ok: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      discount,
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
