import { z } from "zod";

// =================== ITEM SCHEMAS ===================
const stockTransactionItemSchema = z.object({
  product_id: z.string().uuid("ID sản phẩm không hợp lệ"),
  location_id: z.string().uuid("ID vị trí không hợp lệ").optional(),
  quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
  unit_price: z.number().min(0).optional(),
});

const transferStockItemSchema = z.object({
  product_id: z.string().uuid("ID sản phẩm không hợp lệ"),
  quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
});

const adjustStockItemSchema = z.object({
  product_id: z.string().uuid("ID sản phẩm không hợp lệ"),
  location_id: z.string().uuid("ID vị trí không hợp lệ").optional(),
  counted_quantity: z.number().int().min(0, "Số lượng kiểm kê phải >= 0"),
});

export const importStockSchema = z.object({
  warehouse_id: z.string().uuid("ID kho không hợp lệ"),
  supplier_id: z.string().uuid("ID nhà cung cấp không hợp lệ").optional(),
  reference_no: z.string().optional(),
  note: z.string().optional(),
  items: z.array(stockTransactionItemSchema).min(1, "Phải có ít nhất 1 sản phẩm"),
});

export const exportStockSchema = z.object({
  warehouse_id: z.string().uuid("ID kho không hợp lệ"),
  reference_no: z.string().optional(),
  note: z.string().optional(),
  items: z.array(stockTransactionItemSchema).min(1, "Phải có ít nhất 1 sản phẩm"),
});

export const transferStockSchema = z
  .object({
    warehouse_id: z.string().uuid("ID kho nguồn không hợp lệ"),
    target_warehouse_id: z.string().uuid("ID kho đích không hợp lệ"),
    reference_no: z.string().optional(),
    note: z.string().optional(),
    items: z.array(transferStockItemSchema).min(1, "Phải có ít nhất 1 sản phẩm"),
  })
  .refine((data) => data.warehouse_id !== data.target_warehouse_id, {
    message: "Kho đích phải khác kho nguồn",
    path: ["target_warehouse_id"],
  });

export const adjustStockSchema = z.object({
  warehouse_id: z.string().uuid("ID kho không hợp lệ"),
  reference_no: z.string().optional(),
  note: z.string().optional(),
  items: z.array(adjustStockItemSchema).min(1, "Phải có ít nhất 1 sản phẩm"),
});

export type ImportStockInput = z.infer<typeof importStockSchema>;
export type ExportStockInput = z.infer<typeof exportStockSchema>;
export type TransferStockInput = z.infer<typeof transferStockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
