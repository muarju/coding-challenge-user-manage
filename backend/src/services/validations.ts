import { z } from "zod";

export const createUserDto = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  password:  z.string().min(6),
  status:    z.enum(["active","inactive"]).optional()
});

export const updateUserDto = z.object({
  firstName: z.string().min(1).optional(),
  lastName:  z.string().min(1).optional(),
  status:    z.enum(["active","inactive"]).optional()
});

export const authDto = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  password:  z.string().min(6)
});
