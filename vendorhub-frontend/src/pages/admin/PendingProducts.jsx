import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function PendingProducts() {
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => { fetchPending() }, [])

  const fetchPending = async () => {
    const res = await api.get('/admin/products/pending')
    setProducts(res.data)
  }

  const approve = async (id) => {
    await api.put(`/admin/products/${id}/approve`)
    setMessage('Product approved and is now visible to customers.')
    fetchPending()
  }

  const reject = async (id) => {
    await api.put(`/admin/products/${id}/reject`)
    setMessage('Product rejected and removed.')
    fetchPending()
  }

  return (
    <div>
      <h2>Pending Product Approvals</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {products.length === 0 ? (
        <p className="text-muted">No products waiting for approval. ✅</p>
      ) : (
        products.map(p => (
          <div key={p.id} className="card mb-3 p-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5>{p.title}</h5>
                <p className="text-muted mb-1">by {p.vendorName} · ${p.price} · {p.category}</p>
                <p>{p.description}</p>
              </div>
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-success btn-sm"
                  onClick={() => approve(p.id)}>✅ Approve</button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => reject(p.id)}>❌ Reject</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}