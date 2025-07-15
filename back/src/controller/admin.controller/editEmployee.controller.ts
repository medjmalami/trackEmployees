import type { Context } from "hono";
import { errorHelper } from "../../utils/errorHelper";
import { editEmployeeReqSchema } from "../../utils/editEmployeeTypes";
import type { EditEmployeeReq } from "../../utils/editEmployeeTypes";
import { db } from "../../db";
import { employees } from "../../db/schema";
import { eq } from "drizzle-orm";
export const editEmployeeController = async (c: Context) => {
    try{
        let body;
  
        body = await c.req.json();

        if (!body) {
          return c.json(errorHelper.error(400, 'Bad Request'));
        }

        const r: EditEmployeeReq = {
            id: body.id,
            name: body.name,
            position: body.position,
            phone: body.phone,
            dailySalary: body.dailySalary,
        };

        const validation = editEmployeeReqSchema.safeParse(r);

        if (!validation.success) {
          return c.json(errorHelper.error(400, validation.error.message));
        }

        await db.update(employees).set({
            name: r.name,
            position: r.position,
            phone: r.phone,
            dailySalary: r.dailySalary,
        }).where(eq(employees.id, r.id));

        return c.json({
            message: 'Employee updated successfully',
            success: true,
        });

        
    }catch(error){
        return c.json(errorHelper.error(500, 'Internal Server Error'));
    }


}