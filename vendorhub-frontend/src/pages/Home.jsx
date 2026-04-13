import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // useEffect runs code after the component renders
  // The empty array [] means "run only once when the page first loads"
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Build the query string dynamically based on what filters are set
      const params = {}
      if (search) params.search = search
      if (category) params.category = category
      if (maxPrice) params.maxPrice = maxPrice

      const response = await api.get('/products', { params })
      setProducts(response.data)
    } catch (err) {
      console.error('Failed to load products', err)
    } finally {
      setLoading(false)
    }
  }

  // Called when user clicks the Search button
  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div>
      <div className="p-4 mb-4 bg-dark text-white rounded text-center">
        <h1>Welcome to VendorHub</h1>
        <p className="lead">Discover products from verified vendors</p>
      </div>

      {/* Search and Filter Bar */}
      <form onSubmit={handleSearch} className="row g-2 mb-4">
        <div className="col-md-5">
          <input className="form-control" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select"
            value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control"
            placeholder="Max price" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">Search</button>
        </div>
      </form>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>No products found.</h4>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {/* Map over the products array and render a ProductCard for each */}
          {products.map(product => (
            <div className="col" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}