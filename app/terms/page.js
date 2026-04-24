import Navbar from '../../components/Navbar.js'

export const metadata = {
  title: 'Terms of Service — Diffuse Egypt',
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="page-body">
        <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Legal</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', fontWeight: 300, letterSpacing: '0.03em' }}>Terms of Service</h1>
          </div>
        </div>
        <div className="section" style={{ padding: 'clamp(2rem, 4vw, 4rem) clamp(1.25rem, 4vw, 3rem)', maxWidth: '760px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Last updated: January 2025</p>

            {[
              {
                title: '1. Acceptance of Terms',
                body: 'By accessing or purchasing from Diffuse Egypt, you agree to be bound by these Terms of Service. These terms are governed by the laws of the Arab Republic of Egypt, including the Egyptian Consumer Protection Law No. 67 of 2006 and its amendments.',
              },
              {
                title: '2. Products and Pricing',
                body: 'All prices are displayed in Egyptian Pounds (EGP) and include applicable taxes. We reserve the right to update prices without prior notice. All sales are subject to product availability.',
              },
              {
                title: '3. Orders and Payment',
                body: 'By placing an order, you agree to pay the full purchase price including any delivery fees. We accept Cash on Delivery, Instapay, Vodafone Cash, and card payments via Paymob. Orders are confirmed upon payment or acceptance for Cash on Delivery.',
              },
              {
                title: '4. Delivery',
                body: 'We deliver across Egypt. Standard delivery is 2-3 business days within Cairo and 3-5 business days elsewhere. Delivery times are estimates and may vary. Free delivery on orders over EGP 500.',
              },
              {
                title: '5. Returns and Refunds',
                body: 'Our 14-day return policy is available for unworn items in original condition with tags attached. Full details are available on our Returns page. Refunds are processed within 7-10 business days.',
              },
              {
                title: '6. Intellectual Property',
                body: 'All content on this website — including images, text, and designs — is the property of Diffuse Egypt and is protected under applicable Egyptian intellectual property law.',
              },
              {
                title: '7. Limitation of Liability',
                body: 'Diffuse Egypt shall not be liable for indirect or consequential damages arising from the use of this website or its products beyond the maximum extent permitted by Egyptian law.',
              },
              {
                title: '8. Governing Law',
                body: 'These terms shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt. Any disputes shall be subject to the exclusive jurisdiction of the courts of Cairo, Egypt.',
              },
              {
                title: '9. Contact',
                body: 'For any questions regarding these terms, please contact us at hello@diffuse.eg.',
              },
            ].map(s => (
              <div key={s.title}>
                <p className="t-label" style={{ marginBottom: '0.75rem' }}>{s.title}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.85 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
