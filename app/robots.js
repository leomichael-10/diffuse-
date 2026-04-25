export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/cart',
          '/orders',
          '/account',
          '/api/',
          '/login',
          '/register',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://diffuse-egypt3.vercel.app/sitemap.xml',
  }
}
