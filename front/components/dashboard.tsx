"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, DollarSign, Calendar, LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, Shield } from "lucide-react"
import EmployeeForm from "@/components/employee-form"
import type { Employee } from "@/types/employee"
import AttendanceHistory from "@/components/attendance-history"

interface DashboardProps {
  onLogout: () => void
  isAdmin: boolean
  accessToken: string | null
}

export default function Dashboard({ onLogout, isAdmin, accessToken }: DashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState<Employee | null>(null)

  useEffect(() => {
    const getEmployees = async () => {
      const isAdmin = localStorage.getItem("isAdmin") === "true"
      if (isAdmin) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/getEmployees/admin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        const data = await response.json()
        setEmployees(data)

      }else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/getEmployees`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        const data = await response.json()
        setEmployees(data)
      }
  }
    getEmployees()
    
  }, [])

  const deleteEmployee = async (id: string) => {
    if (!isAdmin) {
      alert("Only administrators can delete employees")
      return
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/removeEmployee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id }),
    })
    
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const toggleAttendance = (id: string, date: string) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === id) {
          const attendance = { ...emp.attendance }
          if (attendance[date]) {
            delete attendance[date]
          } else {
            attendance[date] = true
          }
          return { ...emp, attendance }
        }
        return emp
      }),
    )
  }

  const calculateMonthlyPay = (employee: Employee) => {
    if (!isAdmin) return 0

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const daysWorked = Object.keys(employee.attendance!).filter((date) => {
      const workDate = new Date(date)
      return workDate.getMonth() === currentMonth && workDate.getFullYear() === currentYear && employee.attendance![date]
    }).length

    return daysWorked * employee.dailySalary!
  }

  const getTodayAttendance = (employee: Employee) => {
    const today = new Date().toISOString().split("T")[0]
    if (!employee.attendance) return false
    if (!employee.attendance[today]) return false
    return employee.attendance[today]

  }

  const handleSaveEmployee = (employee: Omit<Employee, "id">) => {}

  const totalEmployees = employees.length
  const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + calculateMonthlyPay(emp), 0)
  const presentToday = employees.filter((emp) => getTodayAttendance(emp)).length

  const handlePresenceChange = async (id: string, date: string, presence: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/changePresence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, date, presence }),
    })
    
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
              {isAdmin && (
                <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Admin</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {isAdmin && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentToday}</div>
              <p className="text-xs text-muted-foreground">out of {totalEmployees} employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthlyPayroll.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Current month total</p>
            </CardContent>
          </Card>
        </div>)}

        {/* Employee List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>Manage your team and track attendance</CardDescription>
              </div>
              <div className="flex space-x-2">
                {isAdmin && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                )}
                {isAdmin && (
                <Button variant="outline" onClick={() => setShowHistory(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View History
                </Button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isAdmin ? (
                  "No employees added yet. Click \"Add Employee\" to get started."
                ) : (
                  "No employees found."
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => {
                  const monthlyPay = calculateMonthlyPay(employee)
                  const isPresent = getTodayAttendance(employee)
                  const today = new Date().toISOString().split("T")[0]

                  return (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                          <p className="text-sm text-gray-500">{employee.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {isAdmin && (<div className="text-right">
                          <p className="text-sm font-medium">${employee.dailySalary}/day</p>
                          <p className="text-sm text-gray-600">Monthly: ${monthlyPay.toFixed(2)}</p>
                        </div>)}

                        <Button
                          variant={isPresent ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAttendance(employee.id, today)}
                          className="flex items-center space-x-1"
                        >
                          {isPresent ? (
                            <div onClick={() => handlePresenceChange(employee.id, today, 'false')}>
                              <CheckCircle className="h-4 w-4" />
                              <span>Present</span>
                            </div>
                          ) : (
                            <div onClick={() => handlePresenceChange(employee.id, today, 'true')}>
                              <XCircle className="h-4 w-4" />
                              <span>Absent</span>
                            </div>
                          )}
                        </Button>

                        <div className="flex space-x-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingEmployee(employee)
                                  setShowForm(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteEmployee(employee.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployeeHistory(employee)
                              setShowHistory(true)
                            }}
                            title="View Attendance History"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      { isAdmin && showHistory && (
        <AttendanceHistory
          employees={employees}
          selectedEmployee={selectedEmployeeHistory}
          onClose={() => {
            setShowHistory(false)
            setSelectedEmployeeHistory(null)
          }}
          onUpdateAttendance={(employeeId, date, isPresent) => {
            if (!isAdmin) return
            setEmployees(
              employees.map((emp) => {
                if (emp.id === employeeId) {
                  const attendance = { ...emp.attendance }
                  if (isPresent) {
                    attendance[date] = true
                  } else {
                    delete attendance[date]
                  }
                  return { ...emp, attendance }
                }
                return emp
              }),
            )
          }}
        />
      )}

      {showForm && isAdmin && (
        <EmployeeForm
          accessToken={accessToken}
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onCancel={() => {
            setShowForm(false)
            setEditingEmployee(null)
          }}
        />
      )}
    </div>
  )
}