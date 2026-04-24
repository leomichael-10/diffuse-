import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Diffuse Egypt — Wear the Difference',
  description: 'Premium basics and timeless clothing in Egypt. Shop quality essentials delivered across Cairo, Alexandria and all of Egypt.',
  keywords: 'clothing Egypt, fashion Cairo, basics Egypt, premium clothing Cairo, Diffuse Egypt',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Diffuse Egypt — Wear the Difference',
    description: 'Premium basics delivered across Egypt. Free delivery on orders over EGP 500.',
    type: 'website',
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
