// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getCurrentUser } from '../services/auth'

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
            // Fetch complete user data from API instead of just using JWT data
            try {
              const userData = await getCurrentUser()
              setCurrentUser({ 
                ...userData,
                token
              })
              console.log('[AuthContext][Debug] Set currentUser with complete data:', userData.id)
            } catch (apiError) {
              console.error('[AuthContext] Failed to fetch user data from API:', apiError)
              // Fallback to JWT data if API fails
              setCurrentUser({ 
                id: decoded.id, 
                email: decoded.email, 
                name: decoded.name,
                role: decoded.role,
                token
              })
              console.log('[AuthContext][Debug] Fallback to JWT data for id:', decoded.id)
            }
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
        // Fetch complete user data from API instead of just using JWT data
        try {
          const userData = await getCurrentUser()
          setCurrentUser({ 
            ...userData,
            token
          })
          console.log('[AuthContext][Debug] Set currentUser with complete data (login):', userData.id)
          return userData // Return user data for confirmation
        } catch (apiError) {
          console.error('[AuthContext] Failed to fetch user data from API on login:', apiError)
          // Fallback to JWT data if API fails
          const fallbackUser = { 
            id: decoded.id, 
            email: decoded.email, 
            name: decoded.name,
            role: decoded.role,
            token
          }
          setCurrentUser(fallbackUser)
          console.log('[AuthContext][Debug] Fallback to JWT data for id (login):', decoded.id)
          return fallbackUser // Return fallback data
        }
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

  const refreshUserData = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await getCurrentUser()
        setCurrentUser({ 
          ...userData,
          token
        })
        console.log('[AuthContext][Debug] Refreshed user data:', userData.id)
        return userData
      } catch (error) {
        console.error('[AuthContext] Failed to refresh user data:', error)
        throw error
      }
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

// Optional: still export the hook if you like using it directly
export const useAuth = () => useContext(AuthContext)
