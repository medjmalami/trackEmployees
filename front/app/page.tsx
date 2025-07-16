"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import LoginForm from "@/components/login-form"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("accessToken")
    const adminStatus = localStorage.getItem("isAdmin") === "true"
    
    if (token) {
      setAccessToken(token)
      setIsAdmin(adminStatus)
      setIsAuthenticated(true)
    }
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

      if (response.ok) {
        const data = await response.json()
        
        // Store the token and admin status
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("isAdmin", data.isAdmin.toString())
        
        setAccessToken(data.accessToken)
        setIsAdmin(data.isAdmin)
        setIsAuthenticated(true)
        
        return { success: true, message: "Login successful" }
      } else {
        const errorData = await response.json()
        return { success: false, message: errorData.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("isAdmin")
    setAccessToken(null)
    setIsAdmin(false)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      isAdmin={isAdmin}
      accessToken={accessToken}
    />
  )
}