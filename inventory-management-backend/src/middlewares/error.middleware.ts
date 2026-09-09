import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Lỗi server không xác định";

  console.error(`[Error] ${code}: ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
