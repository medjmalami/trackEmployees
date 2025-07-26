import { z } from "zod";

export const deleteAdvanceReqSchema = z.object({
    employeeId: z.string(),
    date: z.string(),
});

export type DeleteAdvanceReq = z.infer<typeof deleteAdvanceReqSchema>;