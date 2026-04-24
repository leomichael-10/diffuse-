import { NextResponse } from 'next/server'
import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   587,
  secure: false,
  tls:    { rejectUnauthorized: false },
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function POST(request) {
  const { name, email, subject, message } = await request.json()

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  try {
    await transporter.sendMail({
      from:    `"Diffuse Egypt Contact" <${process.env.SMTP_USER}>`,
      to:      process.env.ADMIN_EMAIL || 'hello@diffuse.eg',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #111;">
          <p style="font-size: 1rem; font-weight: 600; margin-bottom: 1.5rem;">New Contact Form Submission</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <tr><td style="padding: 0.5rem 0; color: #555; width: 100px;">Name</td><td style="padding: 0.5rem 0;">${name}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #555;">Email</td><td style="padding: 0.5rem 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 0.5rem 0; color: #555;">Subject</td><td style="padding: 0.5rem 0;">${subject}</td></tr>
          </table>
          <div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; font-size: 0.85rem; line-height: 1.7; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact email error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
