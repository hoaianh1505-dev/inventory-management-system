import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nếu là lỗi validation do Zod ném ra
  if (err instanceof ZodError) {
    const formattedMessage = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: formattedMessage,
      },
    });
  }

  // Các lỗi thông thường khác
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Lỗi server không xác định";

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};
