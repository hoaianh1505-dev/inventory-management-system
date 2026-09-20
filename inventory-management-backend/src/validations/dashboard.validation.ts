import { z } from "zod";

export const queryStockMovementSchema = z.object({
  days: z.coerce.number().min(1, "Số ngày tối thiểu là 1").max(90, "Số ngày tối đa là 90").default(7),
});

export const queryTopProductsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(5),
});

export const queryRecentTransactionsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(5),
});

export type QueryStockMovementInput = z.infer<typeof queryStockMovementSchema>;
export type QueryTopProductsInput = z.infer<typeof queryTopProductsSchema>;
export type QueryRecentTransactionsInput = z.infer<typeof queryRecentTransactionsSchema>;
