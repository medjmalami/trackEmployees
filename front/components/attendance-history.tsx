"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, ChevronLeft, ChevronRight, CheckCircle, XCircle, Calendar, DollarSign } from "lucide-react"
import type { Employee } from "@/types/employee"

interface AttendanceHistoryProps {
  employees: Employee[]
  selectedEmployee?: Employee | null
  onClose: () => void
  onUpdateAttendance: (employeeId: string, date: string, isPresent: boolean) => void
}

export default function AttendanceHistory({
  employees,
  selectedEmployee,
  onClose,
  onUpdateAttendance,
}: AttendanceHistoryProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(selectedEmployee || null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isPresent = (employee: Employee, date: Date) => {
    const dateStr = formatDate(date)
    return employee.attendance![dateStr] || false
  }

  const toggleAttendance = async (employee: Employee, date: Date) => {
    const dateStr = formatDate(date)
    const currentStatus = isPresent(employee, date)
    const newStatus = !currentStatus
    const accessToken = localStorage.getItem("accessToken")
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/changePresence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: employee.id,
          date: dateStr,
          presence: newStatus,
        }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to update attendance")
      }
  
      // Call parent update
      onUpdateAttendance(employee.id, dateStr, newStatus)
  
      // ✅ Update local state to reflect change immediately
      setViewEmployee((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          attendance: {
            ...prev.attendance,
            [dateStr]: newStatus,
          },
        }
      })
    } catch (error) {
      console.error("Error updating attendance:", error)
      alert("Failed to update attendance. Please try again.")
    }
  }
  

  const getMonthlyStats = (employee: Employee, date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const daysWorked = Object.keys(employee.attendance!).filter((dateStr) => {
      // Parse the date string properly to avoid timezone issues
      const [yearStr, monthStr, dayStr] = dateStr.split('-')
      const workDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr))
      return workDate.getFullYear() === year && workDate.getMonth() === month && employee.attendance![dateStr]
    }).length

    const monthlyPay = daysWorked * employee.dailySalary!

    return { daysWorked, monthlyPay }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const days = getDaysInMonth(currentDate)
  const today = new Date()
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance History
              </CardTitle>
              <CardDescription>Track and manage employee attendance for past and current days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Selector */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={viewEmployee?.id || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setViewEmployee(null)
                  } else {
                    const employee = employees.find((emp) => emp.id === value)
                    setViewEmployee(employee || null)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee to view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button variant="outline" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {viewEmployee ? (
            /* Single Employee View */
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {viewEmployee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{viewEmployee.name}</h4>
                  <p className="text-gray-600">{viewEmployee.position}</p>
                  <p className="text-sm text-gray-500">{viewEmployee.phone}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${viewEmployee.dailySalary}/day</span>
                  </div>
                  {(() => {
                    const stats = getMonthlyStats(viewEmployee, currentDate)
                    return (
                      <div className="mt-1">
                        <p className="text-sm font-medium">Days worked: {stats.daysWorked}</p>
                        <p className="text-sm font-medium text-green-600">
                          Monthly pay: ${stats.monthlyPay.toFixed(2)}
                        </p>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2"></div>
                  }

                  const isToday = day.toDateString() === today.toDateString()
                  const isPresentDay = isPresent(viewEmployee, day)
                  const isFutureDate = day > today

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        p-2 border rounded-lg text-center cursor-pointer transition-colors
                        ${isToday ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                        ${isPresentDay ? "bg-green-100 border-green-300" : ""}
                        ${isFutureDate ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
                      `}
                      onClick={() => !isFutureDate && toggleAttendance(viewEmployee, day)}
                    >
                      <div className="text-sm font-medium">{day.getDate()}</div>
                      {!isFutureDate && (
                        <div className="mt-1">
                          {isPresentDay ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* All Employees Overview */
            <div className="space-y-4">
              <h4 className="font-semibold">
                Monthly Overview - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h4>

              {employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No employees to display</div>
              ) : (
                <div className="space-y-3">
                  {employees.map((employee) => {
                    const stats = getMonthlyStats(employee, currentDate)
                    return (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
                      >
                        <div className="flex items-center gap-3">
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
                            <h5 className="font-medium">{employee.name}</h5>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{stats.daysWorked} days worked</p>
                            <p className="text-sm text-green-600">${stats.monthlyPay.toFixed(2)}</p>
                          </div>

                          <Button variant="outline" size="sm" onClick={() => setViewEmployee(employee)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Monthly Totals */}
              {employees.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Monthly Totals</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Days Worked: </span>
                      <span className="font-medium">
                        {employees.reduce((sum, emp) => sum + getMonthlyStats(emp, currentDate).daysWorked, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Total Payroll: </span>
                      <span className="font-medium">
                        $
                        {employees
                          .reduce((sum, emp) => sum + getMonthlyStats(emp, currentDate).monthlyPay, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}