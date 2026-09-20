import { Request, Response, NextFunction } from "express";
import {
  queryStockMovementSchema,
  queryTopProductsSchema,
  queryRecentTransactionsSchema,
} from "../validations/dashboard.validation";
import {
  getFullDashboardService,
  getDashboardStatsService,
  getStockMovementChartService,
  getTopExportedProductsService,
  getRecentTransactionsService,
} from "../services/dashboard.service";

export const getFullDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getFullDashboardService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getDashboardStatsService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovementChart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryStockMovementSchema.parse(req.query);
    const result = await getStockMovementChartService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopExportedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryTopProductsSchema.parse(req.query);
    const result = await getTopExportedProductsService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryRecentTransactionsSchema.parse(req.query);
    const result = await getRecentTransactionsService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
