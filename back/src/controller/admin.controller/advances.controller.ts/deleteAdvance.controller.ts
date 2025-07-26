import { errorHelper } from "../../../utils/errorHelper";
import { db } from "../../../db/index";
import type { Context } from "hono";
import { deleteAdvanceReqSchema } from "../../../utils/deleteAdvanceTypes";
import type { DeleteAdvanceReq } from "../../../utils/deleteAdvanceTypes";
import { employees } from "../../../db/schema";
import { eq } from "drizzle-orm";

const deleteAdvanceController = async (c: Context) => {
  // Parse the request body using Hono's context
  let body;
  try {
    body = await c.req.json();
    if (!body) {
      return c.json(errorHelper.error(400, 'Bad Request'));
    }
    
    const r: DeleteAdvanceReq = {
      employeeId: body.employeeId,
      date: body.date,
    };
    
    const validation = deleteAdvanceReqSchema.safeParse(r);
    if (!validation.success) {
      return c.json(errorHelper.error(400, validation.error.message));
    }
    
    const employee = await db
      .select({ advances: employees.advances })
      .from(employees)
      .where(eq(employees.id, r.employeeId))
      .limit(1);
      
    if (employee.length === 0) {
      return c.json(errorHelper.error(404, 'Employee not found'));
    }
    
    // Get current advances
    const currentAdvances = employee[0].advances || {};
    
    // Check if the date exists in advances
    if (!(r.date in currentAdvances)) {
      return c.json(errorHelper.error(404, 'Advance record not found for the specified date'));
    }
    
    // Create a new object without the specified date
    const updatedAdvances = { ...currentAdvances };
    delete updatedAdvances[r.date];
    
    // Update the database
    await db
      .update(employees)
      .set({
        advances: updatedAdvances
      })
      .where(eq(employees.id, r.employeeId));
      
    return c.json({ message: 'Advance record deleted successfully' });
    
  } catch (error: any) {
    return c.json(errorHelper.error(500, error.message));
  }
};

export { deleteAdvanceController };