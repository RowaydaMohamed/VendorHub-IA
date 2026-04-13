import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function MyOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/orders/my').then(res => setOrders(res.data))
  }, [])

  return (
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-muted">You haven't placed any orders yet.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th><th>Product</th><th>Qty</th><th>Total</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.productTitle}</td>
                <td>{o.quantity}</td>
                <td>${o.totalPrice.toFixed(2)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}