// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

// ✅ Exporting AuthContext
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        console.log('[AuthContext][Debug] Decoded JWT:', decoded)
        // Check for required fields
        if (decoded && decoded.id && decoded.email && decoded.name) {
          setCurrentUser({ 
            id: decoded.id, 
            email: decoded.email, 
            name: decoded.name,
            role: decoded.role, // add role if present
            token // <-- include token
          })
          console.log('[AuthContext][Debug] Set currentUser with id:', decoded.id)
        } else {
          console.error('JWT missing required fields:', decoded)
          setCurrentUser(null)
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('JWT decode error:', error)
        setCurrentUser(null)
        localStorage.removeItem('token')
      }
    } else {
      setCurrentUser(null)
    }
    setLoading(false)
  }, [])

  const login = (token) => {
    localStorage.setItem('token', token)
    const decoded = jwtDecode(token)
    console.log('[AuthContext][Debug] Decoded JWT on login:', decoded)
    setCurrentUser({ 
      id: decoded.id, 
      email: decoded.email, 
      name: decoded.name,
      role: decoded.role, // add role if present
      token // <-- include token
    })
    console.log('[AuthContext][Debug] Set currentUser with id (login):', decoded.id)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Optional: still export the hook if you like using it directly
export const useAuth = () => useContext(AuthContext)
