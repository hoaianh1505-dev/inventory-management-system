import { Request, Response, NextFunction } from "express";
import {
  queryInventorySchema,
  queryLowStockSchema,
} from "../validations/inventory.validation";
import {
  getInventoryService,
  getLowStockService,
  getInventoryByProductService,
} from "../services/inventory.service";

export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryInventorySchema.parse(req.query);
    const result = await getInventoryService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryLowStockSchema.parse(req.query);
    const result = await getLowStockService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const result = await getInventoryByProductService(productId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
