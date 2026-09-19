import { z } from "zod";
import { UserRole } from "../constants";

export const createUserSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
  role: z.nativeEnum(UserRole).default(UserRole.STAFF),
  avatar: z.string().url("URL ảnh đại diện không hợp lệ").optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
  role: z.nativeEnum(UserRole).optional(),
  is_active: z.boolean().optional(),
  avatar: z.string().url("URL ảnh đại diện không hợp lệ").optional().or(z.literal("")),
});

export const queryUserSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  role: z.nativeEnum(UserRole).optional(),
  is_active: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryUserInput = z.infer<typeof queryUserSchema>;
