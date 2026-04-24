import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'

export async function PUT(request, { params }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!id || isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const body = await request.json()

  const user = await prisma.user.update({
    where: { id },
    data: {
      isBanned: body.isBanned !== undefined ? body.isBanned : undefined,
      name:     body.name     !== undefined ? body.name     : undefined,
    },
  })
  return NextResponse.json(user)
}
