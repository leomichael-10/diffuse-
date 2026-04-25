import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  metadataBase: new URL('https://diffuse-egypt3.vercel.app'),
  title: {
    default: 'Diffuse Egypt — Wear the Difference',
    template: '%s | Diffuse Egypt',
  },
  description: 'Premium basics and timeless clothing in Egypt. Shop quality essentials delivered across Cairo, Alexandria and all of Egypt. Free delivery on orders over EGP 500.',
  keywords: [
    'clothing Egypt',
    'fashion Cairo',
    'basics Egypt',
    'premium clothing Cairo',
    'Diffuse Egypt',
    'online shopping Egypt',
    'clothes delivery Cairo',
    'Egyptian fashion',
    'mens clothing Egypt',
    'womens clothing Egypt',
    'ملابس مصر',
    'موضة القاهرة',
    'تسوق ملابس مصر',
  ],
  authors: [{ name: 'Diffuse Egypt' }],
  creator: 'Diffuse Egypt',
  publisher: 'Diffuse Egypt',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_EG',
    url: 'https://diffuse-egypt3.vercel.app',
    siteName: 'Diffuse Egypt',
    title: 'Diffuse Egypt — Wear the Difference',
    description: 'Premium basics and timeless clothing delivered across Egypt.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Diffuse Egypt — Premium Clothing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diffuse Egypt — Wear the Difference',
    description: 'Premium basics and timeless clothing delivered across Egypt.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://diffuse-egypt3.vercel.app',
    languages: { 'en-EG': 'https://diffuse-egypt3.vercel.app' },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2500,
            style: {
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              fontSize:   '0.78rem',
              letterSpacing: '0.02em',
              background: '#111111',
              color:      '#ffffff',
              borderRadius: '0',
              padding:    '0.75rem 1.25rem',
            },
            success: { iconTheme: { primary: '#C9A96E', secondary: '#111111' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  )
}
