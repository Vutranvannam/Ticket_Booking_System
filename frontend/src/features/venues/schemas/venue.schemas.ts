import { z } from "zod";

export const VenueVisibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);

export const VenueSchema = z.object({
  id: z.string().uuid("ID địa điểm không hợp lệ"),
  createdBy: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Tên địa điểm không được để trống").max(200, "Tên địa điểm tối đa 200 ký tự"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  city: z.string().min(1, "Thành phố không được để trống").max(100, "Thành phố tối đa 100 ký tự"),
  state: z.string().max(100, "Tỉnh/Bang tối đa 100 ký tự").nullable().optional(),
  country: z.string().min(1, "Quốc gia không được để trống").max(100, "Quốc gia tối đa 100 ký tự"),
  zipCode: z.string().max(20, "Mã bưu chính tối đa 20 ký tự").nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().max(20, "Số điện thoại tối đa 20 ký tự").nullable().optional(),
  email: z.string().email("Email không hợp lệ").max(255, "Email tối đa 255 ký tự").nullable().optional(),
  description: z.string().nullable().optional(),
  visibility: VenueVisibilitySchema.default("PRIVATE"),
  active: z.boolean(),
  isActive: z.boolean().optional(),
  version: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateVenueRequestSchema = z.object({
  name: z.string().min(1, "Tên địa điểm không được để trống").max(200, "Tên địa điểm tối đa 200 ký tự").trim(),
  address: z.string().min(1, "Địa chỉ không được để trống").trim(),
  city: z.string().min(1, "Thành phố không được để trống").max(100, "Thành phố tối đa 100 ký tự").trim(),
  state: z.string().max(100, "Tỉnh/Bang tối đa 100 ký tự").trim().optional().or(z.literal("")),
  country: z.string().min(1, "Quốc gia không được để trống").max(100, "Quốc gia tối đa 100 ký tự").trim(),
  zipCode: z.string().max(20, "Mã bưu chính tối đa 20 ký tự").trim().optional().or(z.literal("")),
  latitude: z.number().min(-90, "Vĩ độ phải từ -90 đến 90").max(90, "Vĩ độ phải từ -90 đến 90").optional().nullable(),
  longitude: z.number().min(-180, "Kinh độ phải từ -180 đến 180").max(180, "Kinh độ phải từ -180 đến 180").optional().nullable(),
  phone: z.string().max(20, "Số điện thoại tối đa 20 ký tự").trim().optional().or(z.literal("")),
  email: z.string().email("Email không hợp lệ").max(255, "Email tối đa 255 ký tự").trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  visibility: VenueVisibilitySchema.optional().default("PRIVATE"),
});

export const UpdateVenueRequestSchema = z.object({
  name: z.string().max(200, "Tên địa điểm tối đa 200 ký tự").trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().max(100, "Thành phố tối đa 100 ký tự").trim().optional(),
  state: z.string().max(100, "Tỉnh/Bang tối đa 100 ký tự").trim().optional().nullable().or(z.literal("")),
  country: z.string().max(100, "Quốc gia tối đa 100 ký tự").trim().optional(),
  zipCode: z.string().max(20, "Mã bưu chính tối đa 20 ký tự").trim().optional().nullable().or(z.literal("")),
  latitude: z.number().min(-90, "Vĩ độ phải từ -90 đến 90").max(90, "Vĩ độ phải từ -90 đến 90").optional().nullable(),
  longitude: z.number().min(-180, "Kinh độ phải từ -180 đến 180").max(180, "Kinh độ phải từ -180 đến 180").optional().nullable(),
  phone: z.string().max(20, "Số điện thoại tối đa 20 ký tự").trim().optional().nullable().or(z.literal("")),
  email: z.string().email("Email không hợp lệ").max(255, "Email tối đa 255 ký tự").trim().optional().nullable().or(z.literal("")),
  description: z.string().trim().optional().nullable().or(z.literal("")),
  visibility: VenueVisibilitySchema.optional(),
});

export const VenueSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  state: z.string().nullable().optional(),
  country: z.string(),
  visibility: VenueVisibilitySchema,
  active: z.boolean(),
  isActive: z.boolean().optional(),
});

export const PageResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    last: z.boolean(),
  });

// Infer types from schemas
export type VenueVisibility = z.infer<typeof VenueVisibilitySchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type CreateVenueRequest = z.infer<typeof CreateVenueRequestSchema>;
export type UpdateVenueRequest = z.infer<typeof UpdateVenueRequestSchema>;
export type VenueSummary = z.infer<typeof VenueSummarySchema>;
