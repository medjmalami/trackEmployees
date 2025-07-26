import type { Context } from "hono";
import { db } from "../../db";
import { employees } from "../../db/schema";
import { errorHelper } from "../../utils/errorHelper";
export const getEmployeesController = async (c: Context) => {
    try {
        console.log('Attempting to connect to database...');
        const result = await db.select().from(employees);
        console.log('Query successful, rows:', result.length);
        return c.json(result);
    } catch (error) {
        console.error('Database error:', error);
        return c.json(errorHelper.error(500, 'Internal Server Error'));
    }
}