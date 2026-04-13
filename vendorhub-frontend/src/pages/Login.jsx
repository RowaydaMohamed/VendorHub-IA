import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  // useState creates a variable that React watches for changes
  // When it changes, the component re-renders automatically
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent page from refreshing on form submit
    setLoading(true)
    setError('')

    try {
      // POST to /api/auth/login with email and password
      const response = await api.post('/auth/login', { email, password })

      // response.data is what the backend returned: { token, name, role, userId }
      login(response.data)

      // Redirect based on role after login
      if (response.data.role === 'Admin') navigate('/admin/vendors')
      else if (response.data.role === 'Vendor') navigate('/vendor/dashboard')
      else navigate('/')

    } catch (err) {
      // err.response.data is the error message from the backend
      setError(err.response?.data || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow p-4 mt-5">
          <h2 className="text-center mb-4">Login to VendorHub</h2>

          {/* Show error message if login fails */}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              {/* onChange updates the state variable every time user types */}
              <input type="email" className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
            </div>

            <button type="submit" className="btn btn-primary w-100"
              disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-3">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}