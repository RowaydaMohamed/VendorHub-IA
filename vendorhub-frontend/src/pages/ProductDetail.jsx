import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  // useParams reads the :id from the URL e.g. /products/5 → id = "5"
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    const res = await api.get(`/products/${id}`)
    setProduct(res.data)
  }

  const fetchReviews = async () => {
    const res = await api.get(`/reviews/product/${id}`)
    setReviews(res.data)
  }


  const handleAddToFavorites = async () => {
    if (!user) { navigate('/login'); return }
    try {
      await api.post(`/favorites/${product.id}`)
      setMessage('❤️ Added to favorites!')
    } catch (err) {
      setMessage(err.response?.data || 'Already in favorites.')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reviews', {
        productId: parseInt(id),
        ...reviewForm
      })
      setMessage('✅ Review submitted!')
      fetchReviews()
    } catch (err) {
      setMessage(err.response?.data || 'Could not submit review.')
    }
  }

  if (!product) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" />
    </div>
  )

  return (
    <div>
      {message && (
        <div className="alert alert-info alert-dismissible">
          {message}
          <button className="btn-close" onClick={() => setMessage('')} />
        </div>
      )}

      <div className="row">
        {/* Product Image */}
        <div className="col-md-5">
          <img
            src={product.imageUrl || 'https://placehold.co/500x400?text=No+Image'}
            className="img-fluid rounded shadow"
            alt={product.title}
          />
        </div>

        {/* Product Info */}
        <div className="col-md-7">
          <span className="badge bg-secondary mb-2">{product.category}</span>
          <h2>{product.title}</h2>
          <p className="text-muted">Sold by: <strong>{product.vendorName}</strong></p>
          <p>{product.description}</p>

          <h3 className="text-success">${product.price}</h3>
          <p className="text-muted">
            {product.availableUnits > 0
              ? `✅ ${product.availableUnits} units in stock`
              : '❌ Out of stock'}
          </p>

          <p className="text-muted small">👁️ {product.viewerCount} views</p>


        {user?.role === 'Customer' && product.availableUnits > 0 && (
          <div className="d-flex gap-2 align-items-center mb-3">
            <input
              type="number" min="1" max={product.availableUnits}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="form-control w-25"
            />
            <button className="btn btn-success"
              onClick={() => navigate('/checkout', {
                state: { product, quantity }
              })}>
              Buy Now
            </button>
            <button className="btn btn-outline-danger"
              onClick={handleAddToFavorites}>
              ❤️ Save
            </button>
          </div>
        )}

          {/* Prompt non-logged-in users to log in */}
          {!user && (
            <div className="alert alert-warning">
              <a href="/login">Log in</a> to purchase this product.
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <hr className="my-4" />
      <h4>Customer Reviews</h4>

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} className="card mb-2 p-3">
            <div className="d-flex justify-content-between">
              <strong>{review.customerName}</strong>
              <span>{'⭐'.repeat(review.rating)}</span>
            </div>
            <p className="mb-0 mt-1">{review.comment}</p>
          </div>
        ))
      )}

      {/* Review form — only for Customers */}
      {user?.role === 'Customer' && (
        <div className="card p-3 mt-3">
          <h5>Leave a Review</h5>
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-2">
              <label className="form-label">Rating</label>
              <select className="form-select"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({
                  ...reviewForm, rating: parseInt(e.target.value)
                })}>
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>{n} ⭐</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Comment</label>
              <textarea className="form-control" rows="3"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({
                  ...reviewForm, comment: e.target.value
                })} />
            </div>
            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>
        </div>
      )}
    </div>
  )
}