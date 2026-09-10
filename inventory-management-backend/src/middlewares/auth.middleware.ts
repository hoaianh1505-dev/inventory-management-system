import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { UserRole } from "../constants";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      const error: any = new Error("Chưa đăng nhập hoặc phiên đăng nhập hết hạn");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      return next(error);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    const error: any = new Error("Token không hợp lệ hoặc đã hết hạn");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    return next(error);
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error: any = new Error("Chưa xác thực người dùng");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error: any = new Error("Bạn không có quyền thực hiện thao tác này");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      return next(error);
    }

    next();
  };
};
