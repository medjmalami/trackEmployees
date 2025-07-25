import { errorHelper } from "../../utils/errorHelper";
import { db } from "../../db/index";
import type { Context } from "hono";
import type { AddEmployeeReq} from "../../utils/addEmployeeTypes";
import { addEmployeeReqSchema} from "../../utils/addEmployeeTypes";
import { employees } from "../../db/schema";

const addEmployeeController = async (c: Context) => {
  // Parse the request body using Hono's context
  let body;
  try {
    body = await c.req.json();

  if (!body) {
    return c.json(errorHelper.error(400, 'Bad Request'));
  }

  const r : AddEmployeeReq = {
    name: body.name,
    position: body.position,
    phone: body.phone,
    dailySalary: body.dailySalary,
  };

  const validation = addEmployeeReqSchema.safeParse(r);

  if (!validation.success) {
    return c.json(errorHelper.error(400, validation.error.message));
  }


    const [result] = await db.insert(employees).values({
      name : r.name,
      position : r.position,
      phone : r.phone,
      dailySalary : r.dailySalary,
      attendance: {},
      advances: {},
      dateAdded: new Date(),
    }).returning();

    return c.json({
      id : result.id,  
      name : result.name,
      position : result.position,
      phone : result.phone,
      dailySalary : result.dailySalary,
      attendance : result.attendance,
      advances : result.advances,
      message: 'Employee added successfully',
      success: true,
    });
    }catch (error: any) {
    return c.json(errorHelper.error(500, error.message));
  }
};

export { addEmployeeController };