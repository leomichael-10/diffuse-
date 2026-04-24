export default function ProductCardSkeleton() {
  return (
    <div style={{ padding: '0.5rem' }}>
      <div style={{ aspectRatio: '3/4', background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}
        className="shimmer" />
      <div style={{ padding: '0.875rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ height: '12px', width: '65%', background: '#f0f0f0', borderRadius: '2px' }} className="shimmer" />
        <div style={{ height: '12px', width: '30%', background: '#f0f0f0', borderRadius: '2px' }} className="shimmer" />
      </div>
    </div>
  )
}
