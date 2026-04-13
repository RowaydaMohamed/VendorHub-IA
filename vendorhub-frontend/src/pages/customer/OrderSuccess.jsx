import { useLocation, Link } from 'react-router-dom'

export default function OrderSuccess() {
  const { state } = useLocation()
  const { productTitle, quantity, totalPrice, paymentMethod } = state || {}

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 text-center">
        <div className="card shadow p-5">
          <div style={{ fontSize: 64 }}>🎉</div>
          <h2 className="text-success mt-3">Order Placed!</h2>
          <p className="text-muted">Thank you for your purchase.</p>

          <div className="bg-light rounded p-3 text-start mt-3 mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Product</span>
              <span className="fw-bold">{productTitle}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Quantity</span>
              <span className="fw-bold">{quantity}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Payment</span>
              <span className="fw-bold">
                {paymentMethod === 'card' && '💳 Card'}
                {paymentMethod === 'paypal' && '🅿️ PayPal'}
                {paymentMethod === 'cash' && '💵 Cash on Delivery'}
              </span>
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <span className="text-muted">Total Paid</span>
              <span className="fw-bold text-success fs-5">${totalPrice}</span>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-center">
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/orders" className="btn btn-outline-primary">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}