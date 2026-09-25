import { z } from "zod";
import { UserRole } from "../constants";

export const sendIndividualMailSchema = z.object({
  user_id: z.string().optional(),
  email: z.string().email("Email không đúng định dạng").optional(),
  subject: z.string().min(1, "Tiêu đề email không được để trống"),
  message: z.string().min(1, "Nội dung email không được để trống"),
}).refine((data) => data.user_id || data.email, {
  message: "Cần cung cấp ít nhất user_id hoặc email nhận",
  path: ["email"],
});

export const broadcastMailSchema = z.object({
  target_role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, "ALL"]).default("ALL"),
  subject: z.string().min(1, "Tiêu đề email không được để trống"),
  message: z.string().min(1, "Nội dung email không được để trống"),
});

export type SendIndividualMailInput = z.infer<typeof sendIndividualMailSchema>;
export type BroadcastMailInput = z.infer<typeof broadcastMailSchema>;
