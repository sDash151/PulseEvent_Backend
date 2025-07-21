// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

// ✅ Exporting AuthContext
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const decoded = jwtDecode(token)
          console.log('[AuthContext][Debug] Decoded JWT:', decoded)
          
          // Check if token is expired
          const currentTime = Date.now() / 1000
          if (decoded.exp && decoded.exp < currentTime) {
            console.warn('[AuthContext] Token expired, removing...')
            setCurrentUser(null)
            localStorage.removeItem('token')
            setLoading(false)
            return
          }
          
          // Check for required fields
          if (decoded && decoded.id && decoded.email && decoded.name) {
            setCurrentUser({ 
              id: decoded.id, 
              email: decoded.email, 
              name: decoded.name,
              role: decoded.role,
              token
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
    }

    initializeAuth()
  }, [])

  const login = async (token) => {
    localStorage.setItem('token', token)
    
    try {
      const decoded = jwtDecode(token)
      console.log('[AuthContext][Debug] Decoded JWT on login:', decoded)
      
      // Check for required fields
      if (decoded && decoded.id && decoded.email && decoded.name) {
        setCurrentUser({ 
          id: decoded.id, 
          email: decoded.email, 
          name: decoded.name,
          role: decoded.role,
          token
        })
        console.log('[AuthContext][Debug] Set currentUser with id (login):', decoded.id)
      } else {
        console.error('[AuthContext] Login failed - invalid token structure')
        localStorage.removeItem('token')
        throw new Error('Login failed - invalid token structure')
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error)
      localStorage.removeItem('token')
      throw error
    }
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
