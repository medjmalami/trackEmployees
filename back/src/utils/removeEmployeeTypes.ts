import {z} from "zod";

export const removeEmployeeReqSchema = z.object({
      id: z.string().min(1).max(100),
});

export type RemoveEmployeeReq = z.infer<typeof removeEmployeeReqSchema>;