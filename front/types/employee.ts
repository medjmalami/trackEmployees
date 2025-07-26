export interface Employee {
  id: string
  name: string
  position: string
  phone: string
  dailySalary?: number
  attendance?: Record<string, boolean> // date -> present/absent
  advances?: Record<string, number>
}
