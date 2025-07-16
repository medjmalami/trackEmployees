"use client"
import { useState, useEffect } from "react"
import LoginForm from "@/components/login-form"
import Dashboard from "@/components/dashboard"

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  isAdmin: boolean
}

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    isAdmin: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on page load
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    
    if (accessToken && refreshToken) {
      setAuthState({
        isAuthenticated: true,
        accessToken,
        refreshToken,
        isAdmin
      })
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      console.log(data)

      if (data.success) {
        // Store tokens and user info
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        localStorage.setItem("isAdmin", data.isAdmin.toString())

        setAuthState({
          isAuthenticated: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAdmin: data.isAdmin
        })

        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.refreshToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log(data.message) // Log the logout message

      // Clear local storage and reset auth state regardless of API response
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("isAdmin")

      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        isAdmin: false
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear local storage even if API call fails
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("isAdmin")

      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        isAdmin: false
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <Dashboard 
      onLogout={handleLogout} 
      isAdmin={authState.isAdmin}
      accessToken={authState.accessToken}
    />
  )
}