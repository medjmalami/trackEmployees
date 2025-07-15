import type { Context } from "hono";
import { db } from "../../db";
import { employees } from "../../db/schema";
import { errorHelper } from "../../utils/errorHelper";
export const getEmployeesController = async (c: Context) => {
    try{
        const result = await db.select({
            id: employees.id,
            name: employees.name,
            position: employees.position,
            phone: employees.phone,
        }).from(employees);
        return c.json(result);
    }catch(error){

        return c.json(errorHelper.error(500, 'Internal Server Error'));

    }

}