import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(JSON.parse(JSON.stringify(promos)))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { code, discountType, discountValue, minOrderAed, maxUses, expiresAt } = await request.json()
    if (!code || !discountValue) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'percent',
        discountValue,
        ...(minOrderAed !== undefined && minOrderAed !== '' && { minOrderAed }),
        ...(maxUses !== undefined && maxUses !== '' && { maxUses: Number(maxUses) }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(promo)), { status: 201 })
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
