const PAYMOB_BASE = 'https://accept.paymob.com/api'

export async function getAuthToken() {
  if (!process.env.PAYMOB_API_KEY) {
    console.warn('[Paymob] PAYMOB_API_KEY not configured')
    return null
  }
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
  })
  if (!res.ok) throw new Error('Paymob auth failed')
  const data = await res.json()
  return data.token
}

export async function createPaymobOrder(authToken, amountEgp, items = []) {
  const amountCents = Math.round(Number(amountEgp) * 100)
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      auth_token:  authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency:    'EGP',
      items:       items.map(i => ({
        name:          i.name,
        amount_cents:  Math.round(Number(i.priceAed || i.price) * 100),
        description:   i.name,
        quantity:      i.quantity || 1,
      })),
    }),
  })
  if (!res.ok) throw new Error('Paymob order creation failed')
  const data = await res.json()
  return data.id
}

export async function getPaymentKey(authToken, orderId, amountEgp, customer) {
  const amountCents = Math.round(Number(amountEgp) * 100)
  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      auth_token:     authToken,
      amount_cents:   amountCents,
      expiration:     3600,
      order_id:       orderId,
      billing_data: {
        first_name:      customer.firstName || 'Customer',
        last_name:       customer.lastName  || 'Name',
        email:           customer.email     || 'customer@example.com',
        phone_number:    customer.phone     || '+20000000000',
        apartment:       'NA',
        floor:           'NA',
        street:          customer.street    || 'NA',
        building:        'NA',
        shipping_method: 'NA',
        postal_code:     'NA',
        city:            customer.city      || 'Cairo',
        country:         'Egypt',
        state:           'NA',
      },
      currency:       'EGP',
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
    }),
  })
  if (!res.ok) throw new Error('Paymob payment key failed')
  const data = await res.json()
  return data.token
}

export function getPaymentUrl(paymentToken) {
  const iframeId = process.env.PAYMOB_IFRAME_ID
  return `${PAYMOB_BASE}/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`
}

export async function getFullPaymentUrl(amountEgp, items, customer) {
  const authToken    = await getAuthToken()
  const orderId      = await createPaymobOrder(authToken, amountEgp, items)
  const paymentToken = await getPaymentKey(authToken, orderId, amountEgp, customer)
  return { paymentUrl: getPaymentUrl(paymentToken), paymobOrderId: String(orderId) }
}
