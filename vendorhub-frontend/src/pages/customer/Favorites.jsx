import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    api.get('/favorites').then(res => setFavorites(res.data))
  }, [])

  const handleRemove = async (productId) => {
    await api.delete(`/favorites/${productId}`)
    setFavorites(prev => prev.filter(f => f.productId !== productId))
  }

  return (
    <div>
      <h2>❤️ My Favorites</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h5>No favorites yet.</h5>
          <Link to="/" className="btn btn-primary mt-2">Browse Products</Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {favorites.map(fav => (
            <div className="col" key={fav.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5>{fav.productTitle}</h5>
                  <p className="text-success fw-bold">${fav.productPrice}</p>
                  <div className="d-flex gap-2">
                    <Link to={`/products/${fav.productId}`}
                      className="btn btn-primary btn-sm">View</Link>
                    <button className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemove(fav.productId)}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}