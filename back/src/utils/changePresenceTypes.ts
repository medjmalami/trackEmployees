import {  z } from "zod";

export const changePresenceTypes = z.object({
    id: z.string(),
    presence: z.boolean(),
    date: z.string()
});

export type ChangePresence = z.infer<typeof changePresenceTypes>;