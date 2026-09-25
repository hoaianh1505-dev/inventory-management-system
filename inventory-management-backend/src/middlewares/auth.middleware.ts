import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { UserRole } from "../constants";
import { AppError } from "../utils/appError.util";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;

    const token = req.cookies?.access_token || bearerToken;

    if (!token) {
      return next(
        new AppError(
          "Chưa đăng nhập hoặc phiên đăng nhập hết hạn",
          401,
          "UNAUTHORIZED"
        )
      );
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(
      new AppError("Token không hợp lệ hoặc đã hết hạn", 401, "UNAUTHORIZED")
    );
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Chưa xác thực người dùng", 401, "UNAUTHORIZED"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Bạn không có quyền thực hiện thao tác này", 403, "FORBIDDEN")
      );
    }

    next();
  };
};
