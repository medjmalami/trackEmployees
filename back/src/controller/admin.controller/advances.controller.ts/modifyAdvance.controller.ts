import { errorHelper } from "../../../utils/errorHelper";
import { db } from "../../../db/index";    
import type { Context } from "hono";
import { modifyAdvanceReqSchema } from "../../../utils/modifyAdvanceTypes";
import type { ModifyAdvanceReq } from "../../../utils/modifyAdvanceTypes";
import { employees } from "../../../db/schema";
import { eq } from "drizzle-orm";

const modifyAdvanceController = async (c: Context) => {
  // Parse the request body using Hono's context
  let body;
  try {
    body = await c.req.json();

  if (!body) {
    return c.json(errorHelper.error(400, 'Bad Request'));
  }

  const r : ModifyAdvanceReq = {
    employeeId: body.employeeId,
    advance: body.advance,
    date: body.date,
  };

  const validation = modifyAdvanceReqSchema.safeParse(r);

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

    // Merge the attendance data
    const currentAdvances = employee[0].advances || {};
    const updatedAdvances = {
      ...currentAdvances,
      [r.date]: r.advance
    };

    // Update the database
    await db
      .update(employees)
      .set({
        advances: updatedAdvances
      })
      .where(eq(employees.id, r.employeeId));



  

    return c.json({ success: true, message: 'Advance added successfully' });



}catch (error: any) {
    return c.json(errorHelper.error(500, error.message));
  }
};

export { modifyAdvanceController };