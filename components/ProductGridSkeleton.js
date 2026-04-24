import ProductCardSkeleton from './ProductCardSkeleton.js'

export default function ProductGridSkeleton({ count = 8, cols = 4 }) {
  const gridClass = cols === 3 ? 'product-grid-3' : 'product-grid'
  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
