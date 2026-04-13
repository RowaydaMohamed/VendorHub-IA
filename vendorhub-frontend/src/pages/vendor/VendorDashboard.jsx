import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0 })
  const [liveAlert, setLiveAlert] = useState('')

  useEffect(() => {
    fetchNotifications()
    fetchStats()
    setupSignalR()
  }, [])

  const fetchNotifications = async () => {
    const res = await api.get('/notifications')
    setNotifications(res.data)
  }

  const fetchStats = async () => {
    const res = await api.get('/orders/vendor-sales')
    const sales = res.data
    setStats({
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.totalPrice, 0)
    })
  }

  // Set up real-time connection to the backend SignalR hub
  const setupSignalR = () => {
    const token = localStorage.getItem('token')

    // Create the connection — notice the access_token in the query string
    // This is how SignalR authenticates (we configured this in Program.cs)
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5027/hubs/notifications?access_token=${token}`)
      .withAutomaticReconnect() // Reconnects automatically if connection drops
      .build()

    // Define what happens when we receive a notification from the server
    connection.on('ReceiveNotification', (message) => {
      // Show a live banner at the top
      setLiveAlert(message)

      // Add to the notifications list without refreshing the page
      setNotifications(prev => [{
        id: Date.now(),
        message,
        isRead: false,
        createdAt: new Date().toISOString()
      }, ...prev])

      // Hide the banner after 5 seconds
      setTimeout(() => setLiveAlert(''), 5000)
    })

    // Start the connection, then join the vendor's personal group
    connection.start().then(() => {
      connection.invoke('JoinVendorGroup', user.userId.toString())
    }).catch(err => console.error('SignalR error:', err))
  }

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  return (
    <div>
      <h2>Vendor Dashboard</h2>
      <p className="text-muted">Welcome back, {user?.name}</p>

      {/* Live notification banner — appears when a purchase happens in real time */}
      {liveAlert && (
        <div className="alert alert-success alert-dismissible">
          🔔 <strong>New Sale!</strong> {liveAlert}
          <button className="btn-close" onClick={() => setLiveAlert('')} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center p-3 bg-primary text-white">
            <h3>{stats.totalSales}</h3>
            <p className="mb-0">Total Orders</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-3 bg-success text-white">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p className="mb-0">Total Revenue</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-3 bg-warning text-dark">
            <h3>{notifications.filter(n => !n.isRead).length}</h3>
            <p className="mb-0">Unread Notifications</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="d-flex gap-2 mb-4">
        <Link to="/vendor/products" className="btn btn-primary">
          Manage Products
        </Link>
        <Link to="/vendor/sales" className="btn btn-outline-primary">
          View Sales History
        </Link>
      </div>

      {/* Notifications List */}
      <h5>Notifications</h5>
      {notifications.length === 0 ? (
        <p className="text-muted">No notifications yet.</p>
      ) : (
        notifications.map(n => (
          <div key={n.id}
            className={`card mb-2 p-3 ${!n.isRead ? 'border-success' : ''}`}>
            <div className="d-flex justify-content-between align-items-center">
              <span>{n.message}</span>
              {!n.isRead && (
                <button className="btn btn-sm btn-outline-success"
                  onClick={() => markRead(n.id)}>
                  Mark Read
                </button>
              )}
            </div>
            <small className="text-muted">
              {new Date(n.createdAt).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  )
}