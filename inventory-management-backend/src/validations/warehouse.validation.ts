import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string({ required_error: "Tên nhà kho không được để trống" }).min(2, "Tên nhà kho phải từ 2 ký tự"),
  code: z.string({ required_error: "Mã nhà kho không được để trống" }).min(2, "Mã nhà kho phải từ 2 ký tự"),
  address: z.string().optional().nullable(),
  manager_id: z.string().uuid("ID quản lý kho không hợp lệ").optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export const queryWarehouseSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

export const createWarehouseLocationSchema = z.object({
  warehouse_id: z.string({ required_error: "ID nhà kho không được để trống" }).uuid("ID nhà kho không hợp lệ"),
  code: z.string({ required_error: "Mã vị trí không được để trống" }).min(1, "Mã vị trí phải từ 1 ký tự"),
  name: z.string({ required_error: "Tên vị trí không được để trống" }).min(2, "Tên vị trí phải từ 2 ký tự"),
  description: z.string().optional().nullable(),
});

export const updateWarehouseLocationSchema = createWarehouseLocationSchema.omit({ warehouse_id: true }).partial();

export const queryWarehouseLocationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  warehouse_id: z.string().uuid().optional(),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type QueryWarehouseInput = z.infer<typeof queryWarehouseSchema>;

export type CreateWarehouseLocationInput = z.infer<typeof createWarehouseLocationSchema>;
export type UpdateWarehouseLocationInput = z.infer<typeof updateWarehouseLocationSchema>;
export type QueryWarehouseLocationInput = z.infer<typeof queryWarehouseLocationSchema>;
