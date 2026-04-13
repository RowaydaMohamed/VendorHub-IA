import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    category: '', imageUrl: '', availableUnits: ''
  })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const res = await api.get('/products/my')
    setProducts(res.data)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      availableUnits: product.availableUnits
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, form)
        setMessage('Product updated successfully.')
      } else {
        await api.post('/products', form)
        setMessage('Product submitted for admin approval.')
      }
      setShowForm(false)
      setEditingProduct(null)
      setForm({ title:'', description:'', price:'', category:'', imageUrl:'', availableUnits:'' })
      fetchProducts()
    } catch (err) {
      setMessage(err.response?.data || 'Failed to save product.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Products</h2>
        <button className="btn btn-success"
          onClick={() => { setShowForm(!showForm); setEditingProduct(null) }}>
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card p-4 mb-4">
          <h5>{editingProduct ? 'Edit Product' : 'Create New Product'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input name="title" className="form-control"
                  value={form.title} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select name="category" className="form-select"
                  value={form.category} onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows="3"
                  value={form.description} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Price ($)</label>
                <input name="price" type="number" step="0.01"
                  className="form-control"
                  value={form.price} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Available Units</label>
                <input name="availableUnits" type="number"
                  className="form-control"
                  value={form.availableUnits} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Image URL</label>
                <input name="imageUrl" className="form-control"
                  value={form.imageUrl} onChange={handleChange}
                  placeholder="https://..." />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              {editingProduct ? 'Save Changes' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      )}

      {/* Products Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>${p.price}</td>
              <td>{p.availableUnits}</td>
              <td>
                <span className={`badge ${p.isApproved ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {p.isApproved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td>{p.viewerCount}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}