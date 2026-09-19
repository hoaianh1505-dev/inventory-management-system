import { z } from "zod";

export const queryInventorySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  warehouse_id: z.string().uuid("ID nhà kho không hợp lệ").optional(),
  location_id: z.string().uuid("ID vị trí không hợp lệ").optional(),
  product_id: z.string().uuid("ID sản phẩm không hợp lệ").optional(),
  search: z.string().optional(),
});

export const queryLowStockSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  warehouse_id: z.string().uuid("ID nhà kho không hợp lệ").optional(),
});

export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;
export type QueryLowStockInput = z.infer<typeof queryLowStockSchema>;
