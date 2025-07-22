import {z} from "zod";

export const refreshReqSchema = z.object({
    token: z.string(),
});

export type AuthReq = z.infer<typeof refreshReqSchema>;