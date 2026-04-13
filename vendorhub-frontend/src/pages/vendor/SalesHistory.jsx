import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function SalesHistory() {
  const [sales, setSales] = useState([])

  useEffect(() => {
    api.get('/orders/vendor-sales').then(res => setSales(res.data))
  }, [])

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0)

  return (
    <div>
      <h2>Sales History</h2>
      <div className="alert alert-success">
        Total Revenue: <strong>${totalRevenue.toFixed(2)}</strong> from{' '}
        <strong>{sales.length}</strong> orders
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th><th>Product</th><th>Customer</th>
            <th>Qty</th><th>Total</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.productTitle}</td>
              <td>{s.customerName}</td>
              <td>{s.quantity}</td>
              <td>${s.totalPrice.toFixed(2)}</td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}