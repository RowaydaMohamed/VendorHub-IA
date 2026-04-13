import { createContext, useContext, useState, useEffect } from 'react'

// Step 1: Create the context (like creating an empty box)
const AuthContext = createContext()

// Step 2: Create the Provider — this wraps your whole app and fills the box
export function AuthProvider({ children }) {
  // user will be null if not logged in, or an object like:
  // { token, name, role, userId } if logged in
  const [user, setUser] = useState(null)

  // When the app first loads, check if there's a saved token in localStorage
  // This keeps the user logged in even after refreshing the page
  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId')

    if (token) {
      setUser({ token, name, role, userId: parseInt(userId) })
    }
  }, [])

  // Called after successful login — saves user data
  const login = (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('name', userData.name)
    localStorage.setItem('role', userData.role)
    localStorage.setItem('userId', userData.userId)
    setUser(userData)
  }

  // Called when user clicks logout — clears everything
  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    // Provide the user object and helper functions to all child components
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 3: Custom hook — any component can call useAuth() to get the user
export function useAuth() {
  return useContext(AuthContext)
}