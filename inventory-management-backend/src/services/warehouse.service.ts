import { AppDataSource } from "../config/database";
import { Warehouse } from "../entities/Warehouse";
import { WarehouseLocation } from "../entities/WarehouseLocation";
import {
  CreateWarehouseInput,
  UpdateWarehouseInput,
  QueryWarehouseInput,
  CreateWarehouseLocationInput,
  UpdateWarehouseLocationInput,
  QueryWarehouseLocationInput,
} from "../validations/warehouse.validation";
import { AppError } from "../utils/appError.util";
import { ILike } from "typeorm";

const warehouseRepository = AppDataSource.getRepository(Warehouse);
const locationRepository = AppDataSource.getRepository(WarehouseLocation);

export const getWarehousesService = async (query: QueryWarehouseInput) => {
  const { page, limit, search, is_active } = query;
  const skip = (page - 1) * limit;

  const queryBuilder = warehouseRepository
    .createQueryBuilder("warehouse")
    .leftJoinAndSelect("warehouse.manager", "manager")
    .leftJoinAndSelect("warehouse.locations", "locations")
    .orderBy("warehouse.created_at", "DESC")
    .skip(skip)
    .take(limit);

  if (search) {
    queryBuilder.andWhere(
      "(warehouse.name ILIKE :search OR warehouse.code ILIKE :search OR warehouse.address ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  if (is_active !== undefined) {
    queryBuilder.andWhere("warehouse.is_active = :is_active", {
      is_active: is_active === "true",
    });
  }

  const [warehouses, total] = await queryBuilder.getManyAndCount();

  return {
    data: warehouses,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const getWarehouseByIdService = async (id: string) => {
  const warehouse = await warehouseRepository.findOne({
    where: { id },
    relations: ["manager", "locations"],
  });

  if (!warehouse) {
    throw new AppError("Không tìm thấy nhà kho", 404, "NOT_FOUND");
  }

  return warehouse;
};

export const createWarehouseService = async (input: CreateWarehouseInput) => {
  const existingCode = await warehouseRepository.findOne({ where: { code: input.code } });
  if (existingCode) {
    throw new AppError("Mã nhà kho đã tồn tại", 409, "DUPLICATE_CODE");
  }

  const warehouse = warehouseRepository.create({
    name: input.name,
    code: input.code,
    address: input.address || null,
    manager_id: input.manager_id || null,
    is_active: input.is_active ?? true,
  });

  await warehouseRepository.save(warehouse);
  return warehouse;
};

export const updateWarehouseService = async (id: string, input: UpdateWarehouseInput) => {
  const warehouse = await warehouseRepository.findOne({ where: { id } });
  if (!warehouse) {
    throw new AppError("Không tìm thấy nhà kho", 404, "NOT_FOUND");
  }

  if (input.code && input.code !== warehouse.code) {
    const existingCode = await warehouseRepository.findOne({ where: { code: input.code } });
    if (existingCode) {
      throw new AppError("Mã nhà kho đã tồn tại", 409, "DUPLICATE_CODE");
    }
  }

  if (input.name !== undefined) warehouse.name = input.name;
  if (input.code !== undefined) warehouse.code = input.code;
  if (input.address !== undefined) warehouse.address = input.address || null;
  if (input.manager_id !== undefined) warehouse.manager_id = input.manager_id || null;
  if (input.is_active !== undefined) warehouse.is_active = input.is_active;

  await warehouseRepository.save(warehouse);
  return warehouse;
};

export const deleteWarehouseService = async (id: string) => {
  const warehouse = await warehouseRepository.findOne({ where: { id } });
  if (!warehouse) {
    throw new AppError("Không tìm thấy nhà kho", 404, "NOT_FOUND");
  }

  await warehouseRepository.delete(id);
  return { message: "Xóa nhà kho thành công" };
};

export const getWarehouseLocationsService = async (query: QueryWarehouseLocationInput) => {
  const { page, limit, search, warehouse_id } = query;
  const skip = (page - 1) * limit;

  const queryBuilder = locationRepository
    .createQueryBuilder("location")
    .leftJoinAndSelect("location.warehouse", "warehouse")
    .orderBy("location.created_at", "DESC")
    .skip(skip)
    .take(limit);

  if (search) {
    queryBuilder.andWhere(
      "(location.name ILIKE :search OR location.code ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  if (warehouse_id) {
    queryBuilder.andWhere("location.warehouse_id = :warehouse_id", { warehouse_id });
  }

  const [locations, total] = await queryBuilder.getManyAndCount();

  return {
    data: locations,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const getWarehouseLocationByIdService = async (id: string) => {
  const location = await locationRepository.findOne({
    where: { id },
    relations: ["warehouse"],
  });

  if (!location) {
    throw new AppError("Không tìm thấy vị trí kho", 404, "NOT_FOUND");
  }

  return location;
};

export const createWarehouseLocationService = async (input: CreateWarehouseLocationInput) => {
  const warehouse = await warehouseRepository.findOne({ where: { id: input.warehouse_id } });
  if (!warehouse) {
    throw new AppError("Nhà kho không tồn tại", 404, "WAREHOUSE_NOT_FOUND");
  }

  const existingCode = await locationRepository.findOne({
    where: { warehouse_id: input.warehouse_id, code: input.code },
  });

  if (existingCode) {
    throw new AppError("Mã vị trí đã tồn tại trong nhà kho này", 409, "DUPLICATE_LOCATION_CODE");
  }

  const location = locationRepository.create({
    warehouse_id: input.warehouse_id,
    code: input.code,
    name: input.name,
    description: input.description || null,
  });

  await locationRepository.save(location);
  return location;
};

export const updateWarehouseLocationService = async (
  id: string,
  input: UpdateWarehouseLocationInput
) => {
  const location = await locationRepository.findOne({ where: { id } });
  if (!location) {
    throw new AppError("Không tìm thấy vị trí kho", 404, "NOT_FOUND");
  }

  if (input.code && input.code !== location.code) {
    const existingCode = await locationRepository.findOne({
      where: { warehouse_id: location.warehouse_id, code: input.code },
    });

    if (existingCode) {
      throw new AppError("Mã vị trí đã tồn tại trong nhà kho này", 409, "DUPLICATE_LOCATION_CODE");
    }
  }

  if (input.code !== undefined) location.code = input.code;
  if (input.name !== undefined) location.name = input.name;
  if (input.description !== undefined) location.description = input.description || null;

  await locationRepository.save(location);
  return location;
};

export const deleteWarehouseLocationService = async (id: string) => {
  const location = await locationRepository.findOne({ where: { id } });
  if (!location) {
    throw new AppError("Không tìm thấy vị trí kho", 404, "NOT_FOUND");
  }

  await locationRepository.delete(id);
  return { message: "Xóa vị trí kho thành công" };
};
