import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Checkout from './pages/customer/Checkout'
import OrderSuccess from './pages/customer/OrderSuccess'

// Import all pages
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import VendorDashboard from './pages/vendor/VendorDashboard'
import ManageProducts from './pages/vendor/ManageProducts'
import SalesHistory from './pages/vendor/SalesHistory'
import Favorites from './pages/customer/Favorites'
import MyOrders from './pages/customer/MyOrders'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageVendors from './pages/admin/ManageVendors'
import PendingProducts from './pages/admin/PendingProducts'

// ProtectedRoute — prevents users from accessing pages they shouldn't see
// For example, a Customer can't visit /vendor/dashboard
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()

  // Not logged in at all → go to login page
  if (!user) return <Navigate to="/login" />

  // Logged in but wrong role → go home
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" />

  return children
}

function App() {
  return (
    // AuthProvider wraps everything so all pages can access the user state
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        {/* Main content area with some top padding so content doesn't hide behind navbar */}
        <div className="container mt-4">
          <Routes>
            {/* Public routes — anyone can visit these */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Vendor-only routes */}
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute allowedRoles={['Vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute allowedRoles={['Vendor']}>
                <ManageProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/sales" element={
              <ProtectedRoute allowedRoles={['Vendor']}>
                <SalesHistory />
              </ProtectedRoute>
            } />

            {/* Customer-only routes */}
            <Route path="/favorites" element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <MyOrders />
              </ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/vendors" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageVendors />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <PendingProducts />
              </ProtectedRoute>
            } />

            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <OrderSuccess />
              </ProtectedRoute>
            } />


          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App