import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const deviceRegistrationSchema = z.object({
  bootstrapId: z.string().min(8),
  deviceType: z.enum(["hub", "ios", "android", "macos", "school-hub"]),
  deviceName: z.string().min(2).max(255)
});