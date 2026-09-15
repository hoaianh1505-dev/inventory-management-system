import { Request, Response, NextFunction } from "express";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation";
import {
  getCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isTree = req.query.tree === "true";
    const categories = await getCategoriesService(isTree);
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await getCategoryByIdService(id);
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = createCategorySchema.parse(req.body);
    const category = await createCategoryService(validatedInput);
    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedInput = updateCategorySchema.parse(req.body);
    const category = await updateCategoryService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteCategoryService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
