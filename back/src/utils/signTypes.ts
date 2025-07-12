import {z} from 'zod';

export const signinReqSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const signinResSchema = z.object({
    accesstoken: z.string().optional(),
    refreshtoken: z.string().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),

});

export type SigninReq = z.infer<typeof signinReqSchema>;
export type SigninRes = z.infer<typeof signinResSchema>;