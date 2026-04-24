export function formatPrice(amount) {
  const n = Number(amount)
  if (isNaN(n)) return 'EGP 0'
  return `EGP ${n.toLocaleString('en-EG')}`
}

export function formatPriceRaw(amount) {
  return Number(amount).toLocaleString('en-EG')
}

export const DELIVERY_THRESHOLD = 500
export const DELIVERY_FEE = 50
export const CURRENCY = 'EGP'
export const COUNTRY = 'Egypt'
export const CONTACT_EMAIL = 'hello@diffuse.eg'

export const EGYPT_CITIES = [
  'Cairo',
  'Alexandria',
  'Giza',
  'Luxor',
  'Hurghada',
  'Aswan',
  'Mansoura',
  'Tanta',
  'Ismailia',
  'Suez',
  'Port Said',
  'Zagazig',
  'Sharm El Sheikh',
  'Damietta',
  'Minya',
]
