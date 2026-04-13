import { Link } from 'react-router-dom'

// This component receives a "product" object as a prop and displays it as a card
// Props are like arguments you pass to a component
export default function ProductCard({ product }) {
  return (
    <div className="card h-100 shadow-sm">
      {/* Product image — if no image, show a placeholder */}
      <img
        src={product.imageUrl || 'https://placehold.co/300x200?text=No+Image'}
        className="card-img-top"
        alt={product.title}
        style={{ height: '200px', objectFit: 'cover' }}
      />

      <div className="card-body d-flex flex-column">
        {/* Category badge */}
        <span className="badge bg-secondary mb-2 w-fit">{product.category}</span>

        <h5 className="card-title">{product.title}</h5>
        <p className="text-muted small">by {product.vendorName}</p>

        {/* Price and stock info */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fs-5 fw-bold text-success">${product.price}</span>
            <span className="text-muted small">
              {product.availableUnits > 0
                ? `${product.availableUnits} in stock`
                : '❌ Out of stock'}
            </span>
          </div>

          {/* View Details button — navigates to the product's detail page */}
          <Link to={`/products/${product.id}`}
            className="btn btn-primary w-100">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}