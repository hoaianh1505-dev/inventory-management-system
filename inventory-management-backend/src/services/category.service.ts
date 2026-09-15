import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";
import { CreateCategoryInput, UpdateCategoryInput } from "../validations/category.validation";
import { IsNull } from "typeorm";
import { AppError } from "../utils/appError.util";

const categoryRepository = AppDataSource.getRepository(Category);

export const getCategoriesService = async (tree: boolean = false) => {
  if (tree) {
    // Lấy danh sách dạng cây lồng đa cấp (Ông -> Cha -> Cháu)
    const rootCategories = await categoryRepository.find({
      where: { parent_id: IsNull() },
      relations: ["children", "children.children"],
      order: { created_at: "ASC" },
    });
    return rootCategories;
  }

  // Lấy danh sách phẳng (flat list)
  const categories = await categoryRepository.find({
    relations: ["parent"],
    order: { created_at: "ASC" },
  });

  return categories;
};

export const getCategoryByIdService = async (id: string) => {
  const category = await categoryRepository.findOne({
    where: { id },
    relations: ["parent", "children"],
  });

  if (!category) {
    throw new AppError("Không tìm thấy danh mục", 404, "NOT_FOUND");
  }

  return category;
};

export const createCategoryService = async (input: CreateCategoryInput) => {
  if (input.parent_id) {
    const parent = await categoryRepository.findOne({ where: { id: input.parent_id } });
    if (!parent) {
      throw new AppError("Danh mục cha không tồn tại", 404, "PARENT_CATEGORY_NOT_FOUND");
    }
  }

  const category = categoryRepository.create({
    name: input.name,
    description: input.description,
    parent_id: input.parent_id || null,
  });

  await categoryRepository.save(category);
  return category;
};

export const updateCategoryService = async (id: string, input: UpdateCategoryInput) => {
  const category = await categoryRepository.findOne({ where: { id } });

  if (!category) {
    throw new AppError("Không tìm thấy danh mục", 404, "NOT_FOUND");
  }

  if (input.parent_id && input.parent_id === id) {
    throw new AppError("Danh mục không thể làm cha của chính nó", 400, "INVALID_PARENT_CATEGORY");
  }

  if (input.parent_id) {
    const parent = await categoryRepository.findOne({ where: { id: input.parent_id } });
    if (!parent) {
      throw new AppError("Danh mục cha không tồn tại", 404, "PARENT_CATEGORY_NOT_FOUND");
    }
  }

  if (input.name !== undefined) category.name = input.name;
  if (input.description !== undefined) category.description = input.description;
  if (input.parent_id !== undefined) category.parent_id = input.parent_id || null;

  await categoryRepository.save(category);
  return category;
};

export const deleteCategoryService = async (id: string) => {
  const category = await categoryRepository.findOne({ where: { id } });

  if (!category) {
    throw new AppError("Không tìm thấy danh mục", 404, "NOT_FOUND");
  }

  await categoryRepository.delete(id);
  return { message: "Xóa danh mục thành công" };
};
