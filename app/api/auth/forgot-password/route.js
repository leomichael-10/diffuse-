import { NextResponse } from 'next/server'
import { createTransport } from 'nodemailer'
import crypto from 'crypto'
import prisma from '../../../../lib/prisma.js'

const transporter = createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   587,
  secure: false,
  tls:    { rejectUnauthorized: false },
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function POST(request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  if (user) {
    const token  = crypto.randomUUID()
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data:  { resetToken: token, resetTokenExpiry: expiry },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    try {
      await transporter.sendMail({
        from:    `"Diffuse Egypt" <${process.env.SMTP_USER}>`,
        to:      user.email,
        subject: 'Reset your Diffuse password',
        html: `
          <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #111;">
            <p style="font-size: 1.1rem; font-weight: 300; letter-spacing: 0.04em; margin-bottom: 1.5rem;">Reset your password</p>
            <p style="font-size: 0.85rem; line-height: 1.7; color: #555; margin-bottom: 2rem;">
              We received a request to reset the password for your Diffuse account. Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 0.875rem 2rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; font-family: sans-serif;">
              Reset Password
            </a>
            <p style="font-size: 0.75rem; color: #888; margin-top: 2rem; line-height: 1.6;">
              If you did not request this, you can safely ignore this email.<br>
              Your password will not change.
            </p>
            <p style="font-size: 0.7rem; color: #bbb; margin-top: 2rem;">Diffuse Egypt &mdash; Cairo, Egypt</p>
          </div>
        `,
      })
    } catch (err) {
      console.error('Reset email error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
