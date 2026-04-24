import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'
import { sendSellerApproved } from '../../../../../lib/emailTemplates.js'

export async function PUT(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const body = await request.json()

  const seller = await prisma.seller.update({
    where: { id },
    data: {
      isApproved:       body.isApproved       !== undefined ? body.isApproved       : undefined,
      deliveryAvailable: body.deliveryAvailable !== undefined ? body.deliveryAvailable : undefined,
      workingHours:     body.workingHours      !== undefined ? body.workingHours      : undefined,
    },
    include: { user: { select: { email: true, name: true } } },
  })

  if (body.isApproved === true) {
    sendSellerApproved(seller.user.email, seller.businessName).catch(() => {})
  }

  if (body.subscriptionStatus && body.subscriptionId) {
    await prisma.subscription.update({
      where: { id: Number(body.subscriptionId) },
      data: {
        status:     body.subscriptionStatus,
        verifiedAt: body.subscriptionStatus === 'verified' ? new Date() : null,
      },
    })
  }

  return NextResponse.json(seller)
}
