import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'Customer'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // A single handler for all inputs — updates only the field that changed
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register', form)
      setSuccess(
        form.role === 'Vendor'
          ? 'Account created! Please wait for Admin approval before logging in.'
          : 'Account created! You can now log in.'
      )
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data || 'Registration failed.')
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow p-4 mt-5">
          <h2 className="text-center mb-4">Create Account</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-control"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control"
                value={form.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control"
                value={form.password} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">I want to register as:</label>
              <select name="role" className="form-select"
                value={form.role} onChange={handleChange}>
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor (requires Admin approval)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100">
              Register
            </button>
          </form>

          <p className="text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}