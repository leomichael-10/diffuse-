import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { code, discountType, discountValue, minOrderAed, maxUses, expiresAt, isActive } = await request.json()

    const promo = await prisma.promoCode.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue }),
        ...(minOrderAed !== undefined && { minOrderAed: minOrderAed === '' ? null : minOrderAed }),
        ...(maxUses !== undefined && { maxUses: maxUses === '' ? null : Number(maxUses) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(JSON.parse(JSON.stringify(promo)))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.promoCode.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
