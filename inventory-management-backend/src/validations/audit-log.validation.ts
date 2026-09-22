import { z } from "zod";

export const queryAuditLogSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  user_id: z.string().uuid("ID người dùng không hợp lệ").optional(),
  action: z.string().optional(),
  entity_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type QueryAuditLogInput = z.infer<typeof queryAuditLogSchema>;
