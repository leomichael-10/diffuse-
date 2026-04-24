import Navbar from '../../components/Navbar.js'

export const metadata = { title: 'Privacy Policy — Diffuse Egypt' }

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="page-body">
        <div style={{ padding: 'clamp(2rem,4vw,3.5rem) clamp(1.25rem,4vw,3rem)', borderBottom: '1px solid var(--gray-300)' }}>
          <div className="section">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Legal</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.75rem)', fontWeight: 300, letterSpacing: '0.03em' }}>Privacy Policy</h1>
          </div>
        </div>
        <div className="section" style={{ padding: 'clamp(2rem,4vw,4rem) clamp(1.25rem,4vw,3rem)', maxWidth: '760px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Last updated: January 2025</p>
            {[
              { title: '1. Data We Collect', body: 'We collect personal information you provide when creating an account, placing an order, or contacting us: name, email address, phone number, delivery address, and payment details. We also collect browsing data such as pages visited and session duration to improve our service.' },
              { title: '2. How We Use Your Data', body: 'Your data is used to process orders, deliver products, send order updates, respond to enquiries, and improve our website. We do not sell or share your personal information with third parties for marketing purposes.' },
              { title: '3. Payment Security', body: 'Card payments are processed by Paymob, a PCI-DSS compliant payment gateway. We do not store card details on our servers. Cash on Delivery and mobile wallet data is handled securely.' },
              { title: '4. Data Retention', body: 'We retain your personal data for as long as your account is active or as required to provide services. Order history is retained for a minimum of 5 years as required by Egyptian commercial law.' },
              { title: '5. Your Rights', body: 'Under Egyptian data protection regulations, you have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact hello@diffuse.eg.' },
              { title: '6. Cookies', body: 'Our website uses essential cookies for authentication and session management. We do not use third-party advertising cookies. You may disable cookies in your browser settings, though this may affect site functionality.' },
              { title: '7. Third-Party Services', body: 'We use Cloudinary for image hosting and Paymob for payment processing. These services have their own privacy policies and data handling practices.' },
              { title: '8. Changes to This Policy', body: 'We may update this policy periodically. Significant changes will be communicated via email. Continued use of our services after changes constitutes acceptance of the updated policy.' },
              { title: '9. Contact', body: 'For privacy-related enquiries, contact us at hello@diffuse.eg or write to us at our Cairo, Egypt office.' },
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
