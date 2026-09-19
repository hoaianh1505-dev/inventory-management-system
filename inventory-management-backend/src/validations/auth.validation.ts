import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Mật khẩu cũ không được để trống"),
  new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

export const updateProfileSchema = z.object({
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
  avatar: z.string().url("URL ảnh đại diện không hợp lệ").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
