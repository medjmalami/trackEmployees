"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Dashboard from "@/components/dashboard"
import { authFetch } from "@/utils/authFetch"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")
      const adminStatus = localStorage.getItem("isAdmin") === "true"

      if (token && refreshToken) {
        setAccessToken(token)
        setIsAdmin(adminStatus)
        setIsAuthenticated(true)
      } else {
        // No valid tokens, redirect to login
        router.replace("/login")
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      
      if (refreshToken) {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`,
          },
        })

        if (response!.ok) {
          clearAuthData()
          router.replace("/login")
          return { success: true, message: "Logout successful" }
        }
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
    
    // Clear auth data regardless of API call result
    clearAuthData()
    router.replace("/login")
    return { success: false, message: "Logged out locally" }
  }

  const clearAuthData = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("refreshToken")
    setAccessToken(null)
    setIsAdmin(false)
    setIsAuthenticated(false)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // This shouldn't render as useEffect should redirect
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      isAdmin={isAdmin}
      accessToken={accessToken}
    />
  )
}