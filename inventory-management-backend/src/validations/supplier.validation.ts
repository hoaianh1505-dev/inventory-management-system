import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  code: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1, "Tên nhà cung cấp không được để trống").optional(),
  code: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const querySupplierSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  is_active: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type QuerySupplierInput = z.infer<typeof querySupplierSchema>;
