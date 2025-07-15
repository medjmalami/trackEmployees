import { errorHelper } from "../../utils/errorHelper";
import type { Context } from "hono";
import { removeEmployeeReqSchema } from "../../utils/removeEmployeeTypes";
import { db } from "../../db";
import { employees } from "../../db/schema";
import { eq } from "drizzle-orm";

export const removeEmployeeController = async (c: Context) => {

    let body;
    try {
      body = await c.req.json();
  
    if (!body) {
      return c.json(errorHelper.error(400, 'Bad Request'));
    }

    const validation = removeEmployeeReqSchema.safeParse(body);
    if (!validation.success) {
      return c.json(errorHelper.error(400, validation.error.message));
    }
    const id = body.id;

    await db.delete(employees).where(eq(employees.id, id));
    return c.json({ 
      message: 'Employee removed successfully' 
    }, 200);


} catch (error: any) {
  return c.json(errorHelper.error(500, error.message));
}

};