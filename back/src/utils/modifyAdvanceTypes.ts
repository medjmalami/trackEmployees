import { z } from "zod";

export const modifyAdvanceReqSchema = z.object({
    employeeId: z.string(),
    advance: z.number(),
    date: z.string(),
});

export type ModifyAdvanceReq = z.infer<typeof modifyAdvanceReqSchema>;