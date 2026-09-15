import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string({ required_error: "Tên sản phẩm không được để trống" }).min(2, "Tên sản phẩm phải từ 2 ký tự"),
  sku: z.string({ required_error: "Mã SKU không được để trống" }).min(2, "Mã SKU phải từ 2 ký tự"),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  cost_price: z.number().min(0, "Giá nhập phải >= 0").optional().default(0),
  selling_price: z.number().min(0, "Giá bán phải >= 0").optional().default(0),
  low_stock_threshold: z.number().int().min(0, "Ngưỡng cảnh báo tồn kho phải >= 0").optional().default(10),
  category_id: z.string().uuid("ID danh mục không hợp lệ").optional().nullable(),
  unit_id: z.string().uuid("ID đơn vị tính không hợp lệ").optional().nullable(),
  supplier_id: z.string().uuid("ID nhà cung cấp không hợp lệ").optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  low_stock: z.enum(["true", "false"]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
