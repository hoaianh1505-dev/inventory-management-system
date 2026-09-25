import { AppDataSource } from "../config/database";
import { StockTransaction } from "../entities/StockTransaction";
import { StockTransactionItem } from "../entities/StockTransactionItem";
import { Inventory } from "../entities/Inventory";
import { TransactionType } from "../constants";
import { IsNull } from "typeorm";
import { AppError } from "../utils/appError.util";
import {
  ImportStockInput,
  ExportStockInput,
  TransferStockInput,
  AdjustStockInput,
} from "../validations/stock-transaction.validation";
import { emitStockTransactionNotification } from "../config/socket.config";

export const importStockService = async (userId: string, data: ImportStockInput) => {
  return AppDataSource.manager.transaction(async (entityManager) => {
    const stockTransaction = entityManager.create(StockTransaction, {
      type: TransactionType.IMPORT,
      warehouse_id: data.warehouse_id,
      supplier_id: data.supplier_id ?? undefined,
      reference_no: data.reference_no ?? undefined,
      note: data.note ?? undefined,
      created_by_user_id: userId,
    });
    await entityManager.save(stockTransaction);

    for (const item of data.items) {
      const transactionItem = entityManager.create(StockTransactionItem, {
        transaction_id: stockTransaction.id,
        product_id: item.product_id,
        location_id: item.location_id ?? undefined,
        quantity: item.quantity,
        unit_price: item.unit_price ?? 0,
        total_price: (item.unit_price ?? 0) * item.quantity,
      });
      await entityManager.save(transactionItem);

      // IsNull() dùng cho TypeORM khi tìm bản ghi có location_id = NULL
      const existingInventory = await entityManager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          location_id: item.location_id ? item.location_id : IsNull(),
          product_id: item.product_id,
        },
      });

      if (existingInventory) {
        existingInventory.quantity += item.quantity;
        await entityManager.save(existingInventory);
      } else {
        const newInventory = entityManager.create(Inventory, {
          warehouse_id: data.warehouse_id,
          location_id: item.location_id ?? undefined,
          product_id: item.product_id,
          quantity: item.quantity,
        });
        await entityManager.save(newInventory);
      }
    }

    const result = stockTransaction;
    emitStockTransactionNotification({
      transactionId: result.id,
      type: "IMPORT",
      warehouseId: data.warehouse_id,
      referenceNo: data.reference_no ?? undefined,
      itemsCount: data.items.length,
    });
    return result;
  });
};

export const exportStockService = async (userId: string, data: ExportStockInput) => {
  const result = await AppDataSource.manager.transaction(async (entityManager) => {
    const stockTransaction = entityManager.create(StockTransaction, {
      type: TransactionType.EXPORT,
      warehouse_id: data.warehouse_id,
      reference_no: data.reference_no ?? undefined,
      note: data.note ?? undefined,
      created_by_user_id: userId,
    });
    await entityManager.save(stockTransaction);

    for (const item of data.items) {
      const currentInventory = await entityManager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          location_id: item.location_id ? item.location_id : IsNull(),
          product_id: item.product_id,
        },
      });

      if (!currentInventory || currentInventory.quantity < item.quantity) {
        throw new AppError(
          `Không đủ tồn kho sản phẩm ${item.product_id} tại kho/vị trí yêu cầu.`,
          400,
          "OUT_OF_STOCK"
        );
      }

      const transactionItem = entityManager.create(StockTransactionItem, {
        transaction_id: stockTransaction.id,
        product_id: item.product_id,
        location_id: item.location_id ?? undefined,
        quantity: item.quantity,
        unit_price: item.unit_price ?? 0,
        total_price: (item.unit_price ?? 0) * item.quantity,
      });
      await entityManager.save(transactionItem);

      currentInventory.quantity -= item.quantity;
      await entityManager.save(currentInventory);
    }

    return stockTransaction;
  });

  emitStockTransactionNotification({
    transactionId: result.id,
    type: "EXPORT",
    warehouseId: data.warehouse_id,
    referenceNo: data.reference_no ?? undefined,
    itemsCount: data.items.length,
  });

  return result;
};

export const transferStockService = async (userId: string, data: TransferStockInput) => {
  const result = await AppDataSource.manager.transaction(async (entityManager) => {
    const stockTransaction = entityManager.create(StockTransaction, {
      type: TransactionType.TRANSFER,
      warehouse_id: data.warehouse_id,
      target_warehouse_id: data.target_warehouse_id,
      reference_no: data.reference_no ?? undefined,
      note: data.note ?? undefined,
      created_by_user_id: userId,
    });
    await entityManager.save(stockTransaction);

    for (const item of data.items) {
      const sourceInventory = await entityManager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          location_id: IsNull(),
          product_id: item.product_id,
        },
      });

      if (!sourceInventory || sourceInventory.quantity < item.quantity) {
        throw new AppError(
          `Không đủ tồn kho sản phẩm ${item.product_id} tại kho nguồn.`,
          400,
          "OUT_OF_STOCK"
        );
      }

      const transactionItem = entityManager.create(StockTransactionItem, {
        transaction_id: stockTransaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
      });
      await entityManager.save(transactionItem);

      sourceInventory.quantity -= item.quantity;
      await entityManager.save(sourceInventory);

      const targetInventory = await entityManager.findOne(Inventory, {
        where: {
          warehouse_id: data.target_warehouse_id,
          location_id: IsNull(),
          product_id: item.product_id,
        },
      });

      if (targetInventory) {
        targetInventory.quantity += item.quantity;
        await entityManager.save(targetInventory);
      } else {
        const newInventoryAtTarget = entityManager.create(Inventory, {
          warehouse_id: data.target_warehouse_id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
        await entityManager.save(newInventoryAtTarget);
      }
    }

    return stockTransaction;
  });

  emitStockTransactionNotification({
    transactionId: result.id,
    type: "TRANSFER",
    warehouseId: data.warehouse_id,
    referenceNo: data.reference_no ?? undefined,
    itemsCount: data.items.length,
  });

  return result;
};

export const adjustStockService = async (userId: string, data: AdjustStockInput) => {
  const result = await AppDataSource.manager.transaction(async (entityManager) => {
    const stockTransaction = entityManager.create(StockTransaction, {
      type: TransactionType.ADJUSTMENT,
      warehouse_id: data.warehouse_id,
      reference_no: data.reference_no ?? undefined,
      note: data.note ?? undefined,
      created_by_user_id: userId,
    });
    await entityManager.save(stockTransaction);

    for (const item of data.items) {
      const currentInventory = await entityManager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          location_id: item.location_id ? item.location_id : IsNull(),
          product_id: item.product_id,
        },
      });

      const quantityInSystem = currentInventory ? currentInventory.quantity : 0;
      // quantityDifference có thể âm nếu hệ thống đang thừa hơn thực tế
      const quantityDifference = item.counted_quantity - quantityInSystem;

      const transactionItem = entityManager.create(StockTransactionItem, {
        transaction_id: stockTransaction.id,
        product_id: item.product_id,
        location_id: item.location_id ?? undefined,
        quantity: quantityDifference,
        counted_quantity: item.counted_quantity,
      });
      await entityManager.save(transactionItem);

      if (currentInventory) {
        currentInventory.quantity = item.counted_quantity;
        await entityManager.save(currentInventory);
      } else {
        const newInventory = entityManager.create(Inventory, {
          warehouse_id: data.warehouse_id,
          location_id: item.location_id ?? undefined,
          product_id: item.product_id,
          quantity: item.counted_quantity,
        });
        await entityManager.save(newInventory);
      }
    }

    return stockTransaction;
  });

  emitStockTransactionNotification({
    transactionId: result.id,
    type: "ADJUSTMENT",
    warehouseId: data.warehouse_id,
    referenceNo: data.reference_no ?? undefined,
    itemsCount: data.items.length,
  });

  return result;
};

export const getTransactionsService = async (options: {
  page: number;
  limit: number;
  type?: TransactionType;
  warehouse_id?: string;
}) => {
  const { page, limit, type, warehouse_id } = options;

  const queryBuilder = AppDataSource.getRepository(StockTransaction)
    .createQueryBuilder("stockTransaction")
    .leftJoinAndSelect("stockTransaction.warehouse", "warehouse")
    .leftJoinAndSelect("stockTransaction.target_warehouse", "targetWarehouse")
    .leftJoinAndSelect("stockTransaction.created_by", "createdByUser")
    .orderBy("stockTransaction.created_at", "DESC")
    .skip((page - 1) * limit)
    .take(limit);

  if (type) {
    queryBuilder.andWhere("stockTransaction.type = :type", { type });
  }
  if (warehouse_id) {
    queryBuilder.andWhere(
      "(stockTransaction.warehouse_id = :warehouse_id OR stockTransaction.target_warehouse_id = :warehouse_id)",
      { warehouse_id }
    );
  }

  const [items, total] = await queryBuilder.getManyAndCount();
  return { items, total };
};

export const getTransactionByIdService = async (id: string) => {
  const stockTransaction = await AppDataSource.getRepository(StockTransaction).findOne({
    where: { id },
    relations: [
      "items",
      "items.product",
      "warehouse",
      "target_warehouse",
      "created_by",
      "supplier",
    ],
  });

  if (!stockTransaction) {
    throw new AppError("Không tìm thấy giao dịch kho", 404, "NOT_FOUND");
  }

  return stockTransaction;
};
