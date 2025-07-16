import {z} from "zod";

export const authReqSchema = z.object({
    token: z.string(),
});

export type AuthReq = z.infer<typeof authReqSchema>;