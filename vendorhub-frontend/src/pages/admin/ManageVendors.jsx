import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function ManageVendors() {
  const [vendors, setVendors] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => { fetchVendors() }, [])

  const fetchVendors = async () => {
    const res = await api.get('/admin/vendors')
    setVendors(res.data)
  }

  const approve = async (id) => {
    await api.put(`/admin/vendors/${id}/approve`)
    setMessage('Vendor approved!')
    fetchVendors()
  }

  const reject = async (id) => {
    if (!window.confirm('Reject and delete this vendor?')) return
    await api.put(`/admin/vendors/${id}/reject`)
    setMessage('Vendor rejected.')
    fetchVendors()
  }

  return (
    <div>
      <h2>Manage Vendors</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {vendors.map(v => (
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.email}</td>
              <td>
                <span className={`badge ${v.isApproved ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {v.isApproved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td>
                {!v.isApproved && (
                  <button className="btn btn-sm btn-success me-2"
                    onClick={() => approve(v.id)}>Approve</button>
                )}
                <button className="btn btn-sm btn-danger"
                  onClick={() => reject(v.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}