import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên").trim(),
  phone: z.string().optional(),
  avatarUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
