import { Request, Response } from "express";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation";
import {
  getCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";
import { asyncHandler } from "../utils/asyncHandler.util";

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const isTree = req.query.tree === "true";
  const categories = await getCategoriesService(isTree);
  return res.status(200).json({
    success: true,
    data: categories,
  });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await getCategoryByIdService(id);
  return res.status(200).json({
    success: true,
    data: category,
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = createCategorySchema.parse(req.body);
  const category = await createCategoryService(validatedInput);
  return res.status(201).json({
    success: true,
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedInput = updateCategorySchema.parse(req.body);
  const category = await updateCategoryService(id, validatedInput);
  return res.status(200).json({
    success: true,
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteCategoryService(id);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
