import { Request, Response, NextFunction } from "express";
import {
  importStockSchema,
  exportStockSchema,
  transferStockSchema,
  adjustStockSchema,
} from "../validations/stock-transaction.validation";
import {
  importStockService,
  exportStockService,
  transferStockService,
  adjustStockService,
  getTransactionsService,
  getTransactionByIdService,
} from "../services/stock-transaction.service";
import { TransactionType } from "../constants";

export const importStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = importStockSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await importStockService(userId, validatedInput);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const exportStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = exportStockSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await exportStockService(userId, validatedInput);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const transferStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = transferStockSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await transferStockService(userId, validatedInput);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = adjustStockSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await adjustStockService(userId, validatedInput);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as TransactionType | undefined;
    const warehouse_id = req.query.warehouse_id as string | undefined;

    const result = await getTransactionsService({ page, limit, type, warehouse_id });
    return res.status(200).json({
      success: true,
      data: result.items,
      meta: { page, limit, total: result.total },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await getTransactionByIdService(id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
