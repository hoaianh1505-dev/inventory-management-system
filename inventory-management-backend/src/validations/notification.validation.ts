import { z } from "zod";

export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, "Tiêu đề thông báo là bắt buộc"),
  message: z.string().min(1, "Nội dung thông báo là bắt buộc"),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "DANGER", "STOCK_TRANSACTION", "LOW_STOCK"]).default("INFO"),
  targetRoom: z.string().optional().default("global_room"),
  data: z.record(z.any()).optional(),
});

export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;
