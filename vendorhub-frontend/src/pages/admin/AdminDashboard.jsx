import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p className="text-muted">Logged in as {user?.name}</p>

      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card p-4 text-center">
            <h4>👥 Vendor Management</h4>
            <p>Approve or reject vendor registrations</p>
            <Link to="/admin/vendors" className="btn btn-primary">
              Manage Vendors
            </Link>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card p-4 text-center">
            <h4>📦 Product Approvals</h4>
            <p>Review and approve pending product listings</p>
            <Link to="/admin/products" className="btn btn-warning text-dark">
              Review Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}