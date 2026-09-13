import { AppDataSource } from "../config/database";
import { Supplier } from "../entities/Supplier";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  QuerySupplierInput,
} from "../validations/supplier.validation";
import { ILike } from "typeorm";
import { AppError } from "../utils/appError.util";

const supplierRepository = AppDataSource.getRepository(Supplier);

export const getSuppliersService = async (query: QuerySupplierInput) => {
  const { page, limit, is_active, search } = query;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (typeof is_active === "boolean") {
    whereClause.is_active = is_active;
  }

  if (search) {
    whereClause.name = ILike(`%${search}%`);
  }

  const [suppliers, total] = await supplierRepository.findAndCount({
    where: whereClause,
    order: { created_at: "DESC" },
    skip,
    take: limit,
  });

  return {
    data: suppliers,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const getSupplierByIdService = async (id: string) => {
  const supplier = await supplierRepository.findOne({ where: { id } });
  if (!supplier) {
    throw new AppError("Không tìm thấy nhà cung cấp", 404, "NOT_FOUND");
  }
  return supplier;
};

export const createSupplierService = async (input: CreateSupplierInput) => {
  if (input.code) {
    const existing = await supplierRepository.findOne({ where: { code: input.code } });
    if (existing) {
      throw new AppError("Mã nhà cung cấp đã tồn tại", 409, "DUPLICATE_CODE");
    }
  }

  const supplier = supplierRepository.create({
    name: input.name,
    code: input.code || null,
    contact_name: input.contact_name || null,
    email: input.email || null,
    phone: input.phone || null,
    address: input.address || null,
    is_active: true,
  });

  await supplierRepository.save(supplier);
  return supplier;
};

export const updateSupplierService = async (id: string, input: UpdateSupplierInput) => {
  const supplier = await supplierRepository.findOne({ where: { id } });
  if (!supplier) {
    throw new AppError("Không tìm thấy nhà cung cấp", 404, "NOT_FOUND");
  }

  if (input.code && input.code !== supplier.code) {
    const existing = await supplierRepository.findOne({ where: { code: input.code } });
    if (existing) {
      throw new AppError("Mã nhà cung cấp đã tồn tại", 409, "DUPLICATE_CODE");
    }
  }

  if (input.name !== undefined) supplier.name = input.name;
  if (input.code !== undefined) supplier.code = input.code || null;
  if (input.contact_name !== undefined) supplier.contact_name = input.contact_name || null;
  if (input.email !== undefined) supplier.email = input.email || null;
  if (input.phone !== undefined) supplier.phone = input.phone || null;
  if (input.address !== undefined) supplier.address = input.address || null;
  if (input.is_active !== undefined) supplier.is_active = input.is_active;

  await supplierRepository.save(supplier);
  return supplier;
};

export const deleteSupplierService = async (id: string) => {
  const supplier = await supplierRepository.findOne({ where: { id } });
  if (!supplier) {
    throw new AppError("Không tìm thấy nhà cung cấp", 404, "NOT_FOUND");
  }

  await supplierRepository.softDelete(id);
  return { message: "Xóa nhà cung cấp thành công" };
};
