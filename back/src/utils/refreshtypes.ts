import {z} from "zod";

export const refreshReqSchema = z.object({
    token: z.string().min(1).max(100),
});

export type AuthReq = z.infer<typeof refreshReqSchema>;