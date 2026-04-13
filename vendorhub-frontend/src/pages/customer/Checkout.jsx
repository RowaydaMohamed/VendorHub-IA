import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // state contains product and quantity passed from ProductDetail page
  const { product, quantity } = state || {}

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardForm, setCardForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  })
  const [step, setStep] = useState(1) // 1 = payment method, 2 = card details, 3 = confirm
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If no product was passed, redirect home
  if (!product) {
    navigate('/')
    return null
  }

  const totalPrice = (product.price * quantity).toFixed(2)

  const handleCardChange = (e) => {
    let value = e.target.value
    const name = e.target.name

    // Auto-format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16)
      value = value.replace(/(.{4})/g, '$1 ').trim()
    }

    // Auto-format expiry as MM/YY
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4)
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2)
      }
    }

    // CVV max 3 digits
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3)
    }

    setCardForm({ ...cardForm, [name]: value })
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post('/orders', {
        productId: product.id,
        quantity: quantity
      })
      // Navigate to success page
      navigate('/order-success', {
        state: {
          productTitle: product.title,
          quantity,
          totalPrice,
          paymentMethod
        }
      })
    } catch (err) {
      setError(err.response?.data || 'Order failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">

        {/* Progress Bar */}
        <div className="d-flex justify-content-between mb-4 mt-2">
          {['Payment Method', 'Card Details', 'Confirm Order'].map((label, i) => (
            <div key={i} className="text-center flex-fill">
              <div className={`rounded-circle d-inline-flex align-items-center 
                justify-content-center fw-bold mb-1`}
                style={{
                  width: 36, height: 36,
                  backgroundColor: step > i ? '#198754' : step === i + 1 ? '#0d6efd' : '#dee2e6',
                  color: step >= i + 1 ? 'white' : '#6c757d'
                }}>
                {step > i ? '✓' : i + 1}
              </div>
              <div className="small text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Order Summary — always visible */}
        <div className="card mb-4 border-0 bg-light">
          <div className="card-body">
            <h6 className="fw-bold mb-3">📦 Order Summary</h6>
            <div className="d-flex justify-content-between">
              <span>{product.title}</span>
              <span>${product.price}</span>
            </div>
            <div className="d-flex justify-content-between text-muted small">
              <span>Quantity</span>
              <span>× {quantity}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span className="text-success">${totalPrice}</span>
            </div>
          </div>
        </div>

        {/* ── STEP 1: Choose Payment Method ── */}
        {step === 1 && (
          <div className="card shadow-sm p-4">
            <h5 className="mb-4">Choose Payment Method</h5>

            {/* Credit / Debit Card */}
            <div
              className={`border rounded p-3 mb-3 d-flex align-items-center gap-3 
                ${paymentMethod === 'card' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setPaymentMethod('card')}
            >
              <input type="radio" checked={paymentMethod === 'card'} readOnly />
              <span style={{ fontSize: 28 }}>💳</span>
              <div>
                <div className="fw-bold">Credit / Debit Card</div>
                <div className="text-muted small">Visa, Mastercard, American Express</div>
              </div>
            </div>

            {/* PayPal */}
            <div
              className={`border rounded p-3 mb-3 d-flex align-items-center gap-3
                ${paymentMethod === 'paypal' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setPaymentMethod('paypal')}
            >
              <input type="radio" checked={paymentMethod === 'paypal'} readOnly />
              <span style={{ fontSize: 28 }}>🅿️</span>
              <div>
                <div className="fw-bold">PayPal</div>
                <div className="text-muted small">Pay securely with your PayPal account</div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              className={`border rounded p-3 mb-3 d-flex align-items-center gap-3
                ${paymentMethod === 'cash' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setPaymentMethod('cash')}
            >
              <input type="radio" checked={paymentMethod === 'cash'} readOnly />
              <span style={{ fontSize: 28 }}>💵</span>
              <div>
                <div className="fw-bold">Cash on Delivery</div>
                <div className="text-muted small">Pay when your order arrives</div>
              </div>
            </div>

            <button className="btn btn-primary w-100 mt-2"
              onClick={() => setStep(paymentMethod === 'card' ? 2 : 3)}>
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: Card Details (only if card selected) ── */}
        {step === 2 && (
          <div className="card shadow-sm p-4">
            <h5 className="mb-4">💳 Enter Card Details</h5>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label fw-semibold">Name on Card</label>
              <input
                name="cardName"
                className="form-control"
                placeholder="John Smith"
                value={cardForm.cardName}
                onChange={handleCardChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Card Number</label>
              <input
                name="cardNumber"
                className="form-control"
                placeholder="1234 5678 9012 3456"
                value={cardForm.cardNumber}
                onChange={handleCardChange}
              />
            </div>

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label fw-semibold">Expiry Date</label>
                <input
                  name="expiry"
                  className="form-control"
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={handleCardChange}
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label fw-semibold">CVV</label>
                <input
                  name="cvv"
                  className="form-control"
                  placeholder="123"
                  value={cardForm.cvv}
                  onChange={handleCardChange}
                />
              </div>
            </div>

            {/* Card Preview */}
            <div className="rounded p-3 mb-3 text-white"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                minHeight: 120,
                fontFamily: 'monospace'
              }}>
              <div className="small opacity-75 mb-2">💳 Card Preview</div>
              <div className="fs-5 letter-spacing mb-2">
                {cardForm.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="d-flex justify-content-between">
                <span>{cardForm.cardName || 'YOUR NAME'}</span>
                <span>{cardForm.expiry || 'MM/YY'}</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary flex-fill"
                onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn btn-primary flex-fill"
                onClick={() => setStep(3)}
                disabled={
                  !cardForm.cardName ||
                  cardForm.cardNumber.length < 19 ||
                  cardForm.expiry.length < 5 ||
                  cardForm.cvv.length < 3
                }>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm Order ── */}
        {step === 3 && (
          <div className="card shadow-sm p-4">
            <h5 className="mb-4">✅ Confirm Your Order</h5>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <div className="text-muted small mb-1">Product</div>
              <div className="fw-bold">{product.title}</div>
            </div>

            <div className="mb-3">
              <div className="text-muted small mb-1">Quantity</div>
              <div className="fw-bold">{quantity}</div>
            </div>

            <div className="mb-3">
              <div className="text-muted small mb-1">Payment Method</div>
              <div className="fw-bold">
                {paymentMethod === 'card' && `💳 Card ending in ${cardForm.cardNumber.slice(-4)}`}
                {paymentMethod === 'paypal' && '🅿️ PayPal'}
                {paymentMethod === 'cash' && '💵 Cash on Delivery'}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-muted small mb-1">Total Amount</div>
              <div className="fw-bold fs-4 text-success">${totalPrice}</div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary flex-fill"
                onClick={() => setStep(paymentMethod === 'card' ? 2 : 1)}>
                ← Back
              </button>
              <button className="btn btn-success flex-fill"
                onClick={handlePlaceOrder}
                disabled={loading}>
                {loading ? 'Placing Order...' : '🛒 Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}