"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { Employee } from "@/types/employee"
import { authFetch } from "@/utils/authFetch"

interface EmployeeFormProps {
  employee?: Employee | null
  onSave: (employee: Employee | Omit<Employee, "id">) => void
  onCancel: () => void
  accessToken: string | null
}

export default function EmployeeForm({ employee, onSave, onCancel, accessToken }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
    dailySalary: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        position: employee.position,
        phone: employee.phone,
        dailySalary: employee.dailySalary || 0,
      })
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (employee) {
        // Edit existing employee
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/editEmployee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            id: employee.id,
            ...formData,
          }),
        })

        if (!response!.ok) {
          throw new Error('Failed to update employee')
        }

        const updatedEmployee = await response!.json()
        onSave(updatedEmployee)
      } else {
        // Add new employee
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/addEmployee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        })

        if (!response!.ok) {
          throw new Error('Failed to add employee')
        }

        const newEmployee = await response!.json()
        onSave(newEmployee)
      }
    } catch (error) {
      console.error('Error saving employee:', error)
      alert('Failed to save employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dailySalary" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{employee ? "Edit Employee" : "Add New Employee"}</CardTitle>
              <CardDescription>{employee ? "Update employee information" : "Enter employee details"}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input 
                id="position" 
                name="position" 
                value={formData.position} 
                onChange={handleChange} 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailySalary">Daily Salary ($)</Label>
              <Input
                id="dailySalary"
                name="dailySalary"
                type="number"
                min="0"
                step="0.01"
                value={formData.dailySalary}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting 
                  ? (employee ? "Updating..." : "Adding...") 
                  : (employee ? "Update Employee" : "Add Employee")
                }
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}