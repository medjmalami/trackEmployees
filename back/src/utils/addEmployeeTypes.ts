import {z} from "zod";

export const addEmployeeReqSchema = z.object({
      name: z.string().min(2).max(100),
      position: z.string().min(2).max(100),
      phone: z.string().min(8).max(100),
      dailySalary: z.number().min(1).max(100),
});

export const addEmployeeResSchema = z.object({
    message: z.string().optional(),
    success: z.boolean().optional(),
});

export type AddEmployeeReq = z.infer<typeof addEmployeeReqSchema>;
export type AddEmployeeRes = z.infer<typeof addEmployeeResSchema>;