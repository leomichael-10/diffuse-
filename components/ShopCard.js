import Link from 'next/link'

export default function ShopCard({ seller }) {
  const productCount = seller._count?.products || 0
  const initials = seller.businessName.slice(0, 2).toUpperCase()

  return (
    <Link href={`/shops/${seller.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '1.25rem', cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px',
            background: '#0F172A', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0F172A' }}>{seller.businessName}</div>
            <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>{seller.city}{seller.area ? `, ${seller.area}` : ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-navy" style={{ fontSize: '0.7rem' }}>
            {productCount} item{productCount !== 1 ? 's' : ''}
          </span>
          {seller.deliveryAvailable && (
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Delivery Available</span>
          )}
          {seller.rating > 0 && (
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              {seller.rating.toFixed(1)} rating
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
