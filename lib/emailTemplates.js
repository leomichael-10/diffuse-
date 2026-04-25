import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function sendMail({ to, subject, html }) {
  try {
    const transporter = createTransport()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Diffuse <noreply@diffuse.ae>',
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('Email send error:', err.message)
  }
}

const baseStyle = `
  font-family: 'Inter', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`
const headerStyle = `
  background: #0F172A;
  padding: 24px 32px;
  border-radius: 8px 8px 0 0;
`
const bodyStyle = `
  padding: 32px;
  border: 1px solid #E2E8F0;
  border-top: none;
  border-radius: 0 0 8px 8px;
`
const footerStyle = `
  padding: 20px 32px;
  text-align: center;
  color: #64748B;
  font-size: 13px;
`
const btnStyle = `
  display: inline-block;
  background: #3B82F6;
  color: #ffffff;
  padding: 12px 28px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
`

function wrap(content) {
  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">Diffuse</span>
        <span style="color:rgba(255,255,255,0.5); font-size:13px; margin-left:8px;">Fashion Delivered to Your Door</span>
      </div>
      <div style="${bodyStyle}">${content}</div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Diffuse. All rights reserved.<br>
        <span style="color:#94A3B8;">Fashion Delivered to Your Door</span>
      </div>
    </div>
  `
}

export async function sendWelcomeBuyer(to, name) {
  await sendMail({
    to,
    subject: 'Welcome to Diffuse!',
    html: wrap(`
      <h2 style="color:#0F172A; margin:0 0 16px;">Welcome, ${name}!</h2>
      <p style="color:#475569; line-height:1.6;">
        Your Diffuse buyer account is ready. Start browsing hundreds of clothing items from top sellers across Egypt.
      </p>
      <br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${btnStyle}">Start Shopping</a>
    `),
  })
}

export async function sendSellerRegistered(to, businessName) {
  await sendMail({
    to,
    subject: 'Seller Registration Received — Diffuse',
    html: wrap(`
      <h2 style="color:#0F172A; margin:0 0 16px;">Registration Received</h2>
      <p style="color:#475569; line-height:1.6;">
        Thank you for registering <strong>${businessName}</strong> on Diffuse. Our team will verify your payment and activate your account within <strong>24 hours</strong>.
      </p>
      <p style="color:#475569; line-height:1.6; margin-top:12px;">
        You will receive a confirmation email once your account is approved.
      </p>
    `),
  })
}

export async function sendSellerApproved(to, businessName) {
  await sendMail({
    to,
    subject: 'Your Diffuse Seller Account is Approved!',
    html: wrap(`
      <h2 style="color:#0F172A; margin:0 0 16px;">Account Approved!</h2>
      <p style="color:#475569; line-height:1.6;">
        Congratulations! <strong>${businessName}</strong> has been approved on Diffuse. You can now log in and start adding your clothing products.
      </p>
      <br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="${btnStyle}">Go to Dashboard</a>
    `),
  })
}

export async function sendOrderConfirmation(to, order) {
  const itemRows = order.items?.map(item => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #E2E8F0;">${item.name} (${item.size || ''} ${item.color || ''})</td>
      <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:center;">${item.quantity}</td>
      <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:right;">EGP ${item.priceAed}</td>
    </tr>
  `).join('') || ''

  await sendMail({
    to,
    subject: `Order #${order.id} Confirmed — Diffuse`,
    html: wrap(`
      <h2 style="color:#0F172A; margin:0 0 16px;">Order Confirmed!</h2>
      <p style="color:#475569;">Your order <strong>#${order.id}</strong> has been placed successfully.</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:14px;">
        <thead>
          <tr style="background:#F1F5F9;">
            <th style="padding:8px; text-align:left; font-size:12px; color:#64748B; text-transform:uppercase;">Item</th>
            <th style="padding:8px; text-align:center; font-size:12px; color:#64748B; text-transform:uppercase;">Qty</th>
            <th style="padding:8px; text-align:right; font-size:12px; color:#64748B; text-transform:uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="text-align:right; font-size:15px; font-weight:600; color:#0F172A;">
        Total: EGP ${order.totalAed}
      </p>
      <p style="color:#475569; margin-top:16px;">Payment: Cash on Delivery</p>
    `),
  })
}

export async function sendOrderStatusUpdate(to, orderId, status) {
  const messages = {
    confirmed:  'Your order has been confirmed by the seller.',
    processing: 'Your order is being prepared.',
    shipped:    'Your order is on its way!',
    delivered:  'Your order has been delivered. Enjoy your new clothes!',
    cancelled:  'Your order has been cancelled. Contact support if you have questions.',
  }

  await sendMail({
    to,
    subject: `Order #${orderId} Update — Diffuse`,
    html: wrap(`
      <h2 style="color:#0F172A; margin:0 0 16px;">Order Update</h2>
      <p style="color:#475569; font-size:16px;">Order <strong>#${orderId}</strong> status: <strong style="color:#3B82F6;">${status.toUpperCase()}</strong></p>
      <p style="color:#475569; margin-top:12px;">${messages[status] || 'Your order status has been updated.'}</p>
    `),
  })
}
