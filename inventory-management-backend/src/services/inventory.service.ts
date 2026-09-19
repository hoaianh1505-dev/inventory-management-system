import { AppDataSource } from "../config/database";
import { Inventory } from "../entities/Inventory";
import { Product } from "../entities/Product";
import { AppError } from "../utils/appError.util";
import {
  QueryInventoryInput,
  QueryLowStockInput,
} from "../validations/inventory.validation";
import { ILike } from "typeorm";

const inventoryRepository = AppDataSource.getRepository(Inventory);
const productRepository = AppDataSource.getRepository(Product);

export const getInventoryService = async (query: QueryInventoryInput) => {
  const { page, limit, warehouse_id, location_id, product_id, search } = query;
  const skip = (page - 1) * limit;

  const queryBuilder = inventoryRepository
    .createQueryBuilder("inventory")
    .leftJoinAndSelect("inventory.warehouse", "warehouse")
    .leftJoinAndSelect("inventory.location", "location")
    .leftJoinAndSelect("inventory.product", "product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.unit", "unit");

  if (warehouse_id) {
    queryBuilder.andWhere("inventory.warehouse_id = :warehouse_id", { warehouse_id });
  }

  if (location_id) {
    queryBuilder.andWhere("inventory.location_id = :location_id", { location_id });
  }

  if (product_id) {
    queryBuilder.andWhere("inventory.product_id = :product_id", { product_id });
  }

  if (search) {
    queryBuilder.andWhere(
      "(product.name ILIKE :search OR product.sku ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  const [inventories, total] = await queryBuilder
    .orderBy("inventory.updated_at", "DESC")
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data: inventories,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const getLowStockService = async (query: QueryLowStockInput) => {
  const { page, limit, warehouse_id } = query;
  const skip = (page - 1) * limit;

  // Tổng hợp tổng số lượng tồn kho theo sản phẩm để so sánh với low_stock_threshold của sản phẩm
  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.unit", "unit")
    .leftJoin("inventory", "inventory", "inventory.product_id = product.id" + (warehouse_id ? " AND inventory.warehouse_id = :warehouse_id" : ""), { warehouse_id })
    .select([
      "product.id",
      "product.sku",
      "product.name",
      "product.low_stock_threshold",
      "category.id",
      "category.name",
      "unit.id",
      "unit.name",
    ])
    .addSelect("COALESCE(SUM(inventory.quantity), 0)", "total_quantity")
    .groupBy("product.id")
    .addGroupBy("category.id")
    .addGroupBy("unit.id")
    .having("COALESCE(SUM(inventory.quantity), 0) <= product.low_stock_threshold");

  const rawAndEntities = await queryBuilder
    .skip(skip)
    .take(limit)
    .getRawAndEntities();

  const totalCountQuery = productRepository
    .createQueryBuilder("product")
    .leftJoin("inventory", "inventory", "inventory.product_id = product.id" + (warehouse_id ? " AND inventory.warehouse_id = :warehouse_id" : ""), { warehouse_id })
    .groupBy("product.id")
    .having("COALESCE(SUM(inventory.quantity), 0) <= product.low_stock_threshold");

  const rawCountList = await totalCountQuery.getRawMany();
  const total = rawCountList.length;

  const result = rawAndEntities.entities.map((product, index) => {
    const rawItem = rawAndEntities.raw[index];
    const totalQuantity = parseInt(rawItem.total_quantity || "0", 10);
    return {
      product,
      total_quantity: totalQuantity,
      low_stock_threshold: product.low_stock_threshold,
      is_out_of_stock: totalQuantity === 0,
    };
  });

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const getInventoryByProductService = async (productId: string) => {
  const product = await productRepository.findOne({
    where: { id: productId },
    relations: ["category", "unit"],
  });

  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404, "NOT_FOUND");
  }

  const inventoryRecords = await inventoryRepository.find({
    where: { product_id: productId },
    relations: ["warehouse", "location"],
    order: { quantity: "DESC" },
  });

  const totalQuantity = inventoryRecords.reduce(
    (total, record) => total + record.quantity,
    0
  );

  return {
    product,
    total_quantity: totalQuantity,
    low_stock_threshold: product.low_stock_threshold,
    is_low_stock: totalQuantity <= product.low_stock_threshold,
    inventories: inventoryRecords,
  };
};
