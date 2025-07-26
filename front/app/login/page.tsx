"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { authFetch } from "@/utils/authFetch"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    
    if (token && refreshToken) {
      // User is already logged in, redirect to dashboard
      router.replace("/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  // important!
        body: JSON.stringify({ email, password }),
      })

      if (response!.ok) {
        const data = await response!.json()
        
        // Store the tokens and admin status
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("isAdmin", data.isAdmin.toString())
        localStorage.setItem("refreshToken", data.refreshToken)
        
        // Redirect to dashboard
        router.replace("/dashboard")
        
        return { success: true, message: "Login successful" }
      } else {
        const errorData = await response!.json()
        return { success: false, message: errorData.message || "Login failed" }
      }
    } catch (error) {
      return { success: false, message: "Network error. Please try again." }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <LoginForm onLogin={handleLogin} />
}
