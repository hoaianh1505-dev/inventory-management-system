import { z } from "zod";

export const createUnitSchema = z.object({
  name: z.string().min(1, "Tên đơn vị tính không được để trống"),
  symbol: z.string().optional(),
});

export const updateUnitSchema = z.object({
  name: z.string().min(1, "Tên đơn vị tính không được để trống").optional(),
  symbol: z.string().optional(),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
