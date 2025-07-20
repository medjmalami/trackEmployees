"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Calendar, LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, Shield, Menu } from "lucide-react"
import EmployeeForm from "@/components/employee-form"
import type { Employee } from "@/types/employee"
import AttendanceHistory from "@/components/attendance-history"
import { authFetch } from "@/utils/authFetch"

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
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const isAdminFromStorage = localStorage.getItem("isAdmin") === "true"
      const endpoint = isAdminFromStorage ? '/getEmployees/admin' : '/getEmployees'
      
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response!.ok) {
        throw new Error('Failed to fetch employees')
      }

      const data = await response!.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      alert('Failed to load employees. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [accessToken])

  const deleteEmployee = async (id: string) => {
    if (!isAdmin) {
      alert("Only administrators can delete employees")
      return
    }

    if (!confirm("Are you sure you want to delete this employee?")) {
      return
    }

    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/removeEmployee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      })

      if (!response!.ok) {
        throw new Error('Failed to delete employee')
      }

      setEmployees(employees.filter((emp) => emp.id !== id))
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee. Please try again.')
    }
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

    const daysWorked = Object.keys(employee.attendance || {}).filter((date) => {
      const workDate = new Date(date)
      return workDate.getMonth() === currentMonth && workDate.getFullYear() === currentYear && employee.attendance![date]
    }).length

    return daysWorked * (employee.dailySalary || 0)
  }

  const getTodayAttendance = (employee: Employee) => {
    const today = new Date().toISOString().split("T")[0]
    if (!employee.attendance) return false
    return employee.attendance[today] || false
  }

  const handleSaveEmployee = (savedEmployee: Employee | Omit<Employee, "id">) => {
    if ('id' in savedEmployee) {
      // Update existing employee
      setEmployees(employees.map(emp => 
        emp.id === savedEmployee.id ? savedEmployee : emp
      ))
    } else {
      // Add new employee - the API should return the new employee with ID
      setEmployees([...employees, savedEmployee as Employee])
    }
    
    setShowForm(false)
    setEditingEmployee(null)
    
    // Refresh the employee list to get the latest data
    fetchEmployees()
  }

  const totalEmployees = employees.length
  const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + calculateMonthlyPay(emp), 0)
  const presentToday = employees.filter((emp) => getTodayAttendance(emp)).length

  const handlePresenceChange = async (id: string, date: string, presence: string) => {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/changePresence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id, date, presence }),
      })

      if (!response!.ok) {
        throw new Error('Failed to update presence')
      }

      // Update local state
      toggleAttendance(id, date)
    } catch (error) {
      console.error('Error updating presence:', error)
      alert('Failed to update attendance. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                  Employee Management
                </h1>
                {isAdmin && (
                  <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full mt-1 sm:mt-0 w-fit">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    <span className="text-xs sm:text-sm text-blue-600 font-medium">Admin</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Desktop logout button */}
            <div className="hidden sm:block">
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="sm:hidden border-t py-2">
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <span className="h-4 w-4 text-xs font-semibold flex items-center justify-center">TND</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMonthlyPayroll.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Current month total</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">Employees</CardTitle>
                <CardDescription className="text-sm">Manage your team and track attendance</CardDescription>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                {isAdmin && (
                  <>
                    <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowHistory(true)}
                      className="w-full sm:w-auto"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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
                    <div key={employee.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg bg-white space-y-4 sm:space-y-0">
                      {/* Employee Info */}
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarFallback className="text-sm sm:text-base">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{employee.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{employee.position}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{employee.phone}</p>
                        </div>
                      </div>

                      {/* Actions and Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        {/* Salary Info */}
                        {isAdmin && (
                          <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm font-medium">TND {employee.dailySalary}/day</p>
                            <p className="text-xs sm:text-sm text-gray-600">Monthly: TND {monthlyPay.toFixed(2)}</p>
                          </div>
                        )}

                        {/* Attendance Button */}
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <Button
                            variant={isPresent ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePresenceChange(employee.id, today, isPresent ? 'false' : 'true')}
                            className="flex items-center space-x-1 flex-1 sm:flex-none"
                          >
                            {isPresent ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">Present</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">Absent</span>
                              </>
                            )}
                          </Button>

                          {/* Action Buttons */}
                          <div className="flex space-x-1 sm:space-x-2">
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingEmployee(employee)
                                    setShowForm(true)
                                  }}
                                  className="px-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => deleteEmployee(employee.id)}
                                  className="px-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployeeHistory(employee)
                                    setShowHistory(true)
                                  }}
                                  title="View Attendance History"
                                  className="px-2"
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
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

      {isAdmin && showHistory && (
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
