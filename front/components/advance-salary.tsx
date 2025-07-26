import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  DollarSign, Plus, Edit, Trash2, X } from "lucide-react"
import { authFetch } from "@/utils/authFetch"
import type { Employee } from "@/types/employee"

interface AdvanceManagementProps {
  employees: Employee[]
  onAdvanceUpdate: () => void
  isAdmin: boolean
}

interface AdvanceEntry {
  date: string
  amount: number
}

export default function AdvanceManagement({ employees, onAdvanceUpdate, isAdmin }: AdvanceManagementProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingAdvance, setEditingAdvance] = useState<AdvanceEntry | null>(null)
  const [newAdvance, setNewAdvance] = useState({ date: "", amount: "" })
  const [isLoading, setIsLoading] = useState(false)

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get advances for selected employee
  const getEmployeeAdvances = (employee: Employee): AdvanceEntry[] => {
    if (!employee.advances) return []
    
    return Object.entries(employee.advances)
      .map(([date, amount]) => ({ date, amount: Number(amount) || 0 }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Calculate total advances for current month
  const getCurrentMonthAdvances = (employee: Employee): number => {
    if (!employee.advances) return 0
    
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return Object.entries(employee.advances)
      .filter(([date]) => {
        const advanceDate = new Date(date)
        return advanceDate.getMonth() === currentMonth && 
               advanceDate.getFullYear() === currentYear
      })
      .reduce((total, [, amount]) => total + (Number(amount) || 0), 0)
  }

  // Add or modify advance
  const handleAddAdvance = async () => {
    if (!selectedEmployee || !newAdvance.date || !newAdvance.amount) {
      alert("Please fill in all fields")
      return
    }

    if (Number(newAdvance.amount) <= 0) {
      alert("Advance amount must be greater than 0")
      return
    }

    setIsLoading(true)
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/modifyAdvance`, {
        method: "POST",
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          date: newAdvance.date,
          advance: Number(newAdvance.amount)
        }),
      })

      if (!response?.ok) {
        const errorData = await response?.json()
        throw new Error(errorData?.message || "Failed to add advance")
      }

      setNewAdvance({ date: "", amount: "" })
      setShowAddDialog(false)
      onAdvanceUpdate()
      alert("Advance added successfully")
    } catch (error) {
      alert(`Failed to add advance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Edit advance
  const handleEditAdvance = async () => {
    if (!selectedEmployee || !editingAdvance || !editingAdvance.amount) {
      alert("Invalid advance data")
      return
    }

    if (editingAdvance.amount <= 0) {
      alert("Advance amount must be greater than 0")
      return
    }

    setIsLoading(true)
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/modifyAdvance`, {
        method: "POST",
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          date: editingAdvance.date,
          advance: editingAdvance.amount
        }),
      })

      if (!response?.ok) {
        const errorData = await response?.json()
        throw new Error(errorData?.message || "Failed to update advance")
      }

      setEditingAdvance(null)
      setShowEditDialog(false)
      onAdvanceUpdate()
      alert("Advance updated successfully")
    } catch (error) {
      alert(`Failed to update advance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete advance
  const handleDeleteAdvance = async (date: string) => {
    if (!selectedEmployee) return

    if (!confirm("Are you sure you want to delete this advance?")) return

    setIsLoading(true)
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deleteAdvance`, {
        method: "POST",
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          date: date
        }),
      })

      if (!response?.ok) {
        const errorData = await response?.json()
        throw new Error(errorData?.message || "Failed to delete advance")
      }

      onAdvanceUpdate()
      alert("Advance deleted successfully")
    } catch (error) {
      alert(`Failed to delete advance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Advance Management
          </CardTitle>
          <CardDescription>
            View employee advances (Admin access required for modifications)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Admin privileges required to manage advances
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Advance Management
        </CardTitle>
        <CardDescription>
          Manage salary advances for employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Selection */}
        <div className="space-y-2">
          <Label>Select Employee</Label>
          <Select
            value={selectedEmployee?.id || ""}
            onValueChange={(value) => {
              const employee = employees.find(emp => emp.id === value)
              setSelectedEmployee(employee || null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmployee && (
          <div className="space-y-4">
            {/* Employee Info & Add Button */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">{selectedEmployee.name}</h4>
                <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-500">
                  Current Month Advances: TND {getCurrentMonthAdvances(selectedEmployee).toFixed(2)}
                </p>
              </div>
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Advance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Advance</DialogTitle>
                    <DialogDescription>
                      Add a salary advance for {selectedEmployee.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="advance-date">Date</Label>
                      <Input
                        id="advance-date"
                        type="date"
                        value={newAdvance.date}
                        max={getTodayDate()}
                        onChange={(e) => setNewAdvance(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="advance-amount">Amount (TND)</Label>
                      <Input
                        id="advance-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newAdvance.amount}
                        onChange={(e) => setNewAdvance(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddAdvance} 
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? "Adding..." : "Add Advance"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddDialog(false)
                          setNewAdvance({ date: "", amount: "" })
                        }}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Advances List */}
            <div className="space-y-2">
              <h5 className="font-medium">Advance History</h5>
              {(() => {
                const advances = getEmployeeAdvances(selectedEmployee)
                
                if (advances.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      No advances recorded for this employee
                    </div>
                  )
                }

                return (
                  <div className="space-y-2">
                    {advances.map((advance) => (
                      <div
                        key={advance.date}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(advance.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">TND {advance.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAdvance(advance)
                              setShowEditDialog(true)
                            }}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAdvance(advance.date)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Advance</DialogTitle>
              <DialogDescription>
                Modify the advance amount for {selectedEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {editingAdvance && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingAdvance.date}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount (TND)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingAdvance.amount}
                    onChange={(e) => setEditingAdvance(prev => 
                      prev ? { ...prev, amount: Number(e.target.value) } : null
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleEditAdvance} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Updating..." : "Update Advance"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditDialog(false)
                      setEditingAdvance(null)
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}