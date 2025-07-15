import type { Context } from "hono";
import { changePresenceTypes } from "../utils/changePresenceTypes";
import type { ChangePresence } from "../utils/changePresenceTypes";
import { errorHelper } from "../utils/errorHelper";
import { db } from "../db";
import { employees } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const changePresenceController = async (c: Context) => {
  try {
    let body;
    body = await c.req.json();
    if (!body) {
      return c.json(errorHelper.error(400, 'Bad Request'));
    }
    
    const r: ChangePresence = {
      id: body.id,
      presence: body.presence === 'true' || body.presence === true,
      date: body.date,
    };
    
    const validation = changePresenceTypes.safeParse(r);
    if (!validation.success) {
      return c.json(errorHelper.error(400, validation.error.message));
    }

    // Get current attendance
    const employee = await db
      .select({ attendance: employees.attendance })
      .from(employees)
      .where(eq(employees.id, r.id))
      .limit(1);

    if (employee.length === 0) {
      return c.json(errorHelper.error(404, 'Employee not found'));
    }

    // Merge the attendance data
    const currentAttendance = employee[0].attendance || {};
    const updatedAttendance = {
      ...currentAttendance,
      [r.date]: r.presence
    };

    // Update the database
    await db
      .update(employees)
      .set({
        attendance: updatedAttendance
      })
      .where(eq(employees.id, r.id));

    return c.json({ success: true, message: 'Presence updated successfully' });
    
  } catch (e: any) {
    return c.json(errorHelper.error(500, 'Internal Server Error'));
  }
}

export default changePresenceController;