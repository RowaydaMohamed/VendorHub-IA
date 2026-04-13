import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      {/* Brand logo/name — clicking it goes home */}
      <Link className="navbar-brand fw-bold" to="/">🛍️ VendorHub</Link>

      {/* Bootstrap's collapsible menu for mobile screens */}
      <button className="navbar-toggler" type="button"
        data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Browse Products</Link>
          </li>

          {/* Only show these links if logged in as Vendor */}
          {user?.role === 'Vendor' && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/vendor/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/vendor/products">My Products</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/vendor/sales">Sales</Link>
              </li>
            </>
          )}

          {/* Only show these links if logged in as Customer */}
          {user?.role === 'Customer' && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/favorites">❤️ Favorites</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/orders">My Orders</Link>
              </li>
            </>
          )}

          {/* Only show these links if logged in as Admin */}
          {user?.role === 'Admin' && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/vendors">Vendors</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/products">Pending Products</Link>
              </li>
            </>
          )}
        </ul>

        {/* Right side of navbar — login/logout */}
        <ul className="navbar-nav">
          {user ? (
            <>
              <li className="nav-item">
                {/* Show who is logged in and their role */}
                <span className="nav-link text-warning">
                  👤 {user.name} ({user.role})
                </span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm mt-1"
                  onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}