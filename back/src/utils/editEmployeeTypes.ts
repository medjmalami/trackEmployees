import { z } from "zod";

export const editEmployeeReqSchema = z.object({
    id: z.string(),
    name: z.string(),
    position: z.string(),
    phone: z.string(),
    dailySalary: z.number(),
});

export type EditEmployeeReq = z.infer<typeof editEmployeeReqSchema>;