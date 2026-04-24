import Navbar from '../../components/Navbar.js'

export const metadata = {
  title: 'Returns & Exchanges — Diffuse Egypt',
  description: '14-day return policy. Easy returns and exchanges across Egypt.',
}

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <div className="page-body">
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Policy</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', fontWeight: 300, letterSpacing: '0.03em' }}>
              Returns &amp; Exchanges
            </h1>
          </div>
        </div>

        <div className="section" style={{ padding: 'clamp(2rem, 4vw, 4rem) clamp(1.25rem, 4vw, 3rem)', maxWidth: '760px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            <div style={{ padding: '1.5rem', background: 'var(--gray-100)', borderLeft: '3px solid var(--sand)' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--black)', lineHeight: 1.7 }}>
                We offer a <strong>14-day return policy</strong> on all orders. Items must be returned in original condition — unworn, unwashed, with all tags attached.
              </p>
            </div>

            {[
              {
                title: 'Eligibility',
                items: [
                  'Items must be returned within 14 days of delivery',
                  'Items must be unworn and in original condition with tags attached',
                  'Sale items and intimates are final sale and cannot be returned',
                  'Items showing signs of wear, washing, or alteration will not be accepted',
                ],
              },
              {
                title: 'How to Return',
                items: [
                  'Contact us via WhatsApp or email hello@diffuse.eg within 14 days of receiving your order',
                  'State your order number and the items you wish to return',
                  'We will arrange a collection or provide return instructions',
                  'Returns must be securely packaged in original packaging where possible',
                ],
              },
              {
                title: 'Refunds',
                items: [
                  'Refunds are processed within 7-10 business days of receiving the returned item',
                  'Refunds are issued to the original payment method',
                  'Cash on Delivery orders: refund via Instapay or Vodafone Cash',
                  'Card payments: refund to the original card',
                  'Delivery fees are non-refundable unless the item was faulty',
                ],
              },
              {
                title: 'Exchanges',
                items: [
                  'Exchanges for different sizes or colours are available within 14 days',
                  'Subject to stock availability',
                  'Contact hello@diffuse.eg to request an exchange',
                  'Any price difference will be charged or refunded accordingly',
                ],
              },
              {
                title: 'Faulty or Incorrect Items',
                items: [
                  'If you receive a faulty or incorrect item, contact us immediately',
                  'We will arrange collection and replacement at no cost to you',
                  'Photographs may be requested to assess the fault',
                ],
              },
            ].map(section => (
              <div key={section.title}>
                <p className="t-label" style={{ marginBottom: '1rem' }}>{section.title}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {section.items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                      <span style={{ color: 'var(--sand)', flexShrink: 0, marginTop: '0.15rem' }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '2rem' }}>
              <p className="t-label" style={{ marginBottom: '1rem' }}>Contact for Returns</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>Email: hello@diffuse.eg</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>Hours: Sunday — Thursday, 9:00am — 6:00pm (Cairo time)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
