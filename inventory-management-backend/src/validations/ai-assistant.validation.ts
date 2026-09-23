import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string({ required_error: "Câu hỏi không được để trống" }).min(1, "Câu hỏi không được để trống"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
