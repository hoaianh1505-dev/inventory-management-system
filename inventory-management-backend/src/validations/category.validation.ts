import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  description: z.string().optional(),
  parent_id: z.string().uuid("ID danh mục cha không đúng định dạng UUID").nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").optional(),
  description: z.string().optional(),
  parent_id: z.string().uuid("ID danh mục cha không đúng định dạng UUID").nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
