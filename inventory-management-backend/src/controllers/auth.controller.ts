import { Request, Response } from "express";
import { loginSchema, changePasswordSchema } from "../validations/auth.validation";
import {
  loginService,
  getMeService,
  changePasswordService,
} from "../services/auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { AppError } from "../utils/appError.util";

const isProduction = process.env.NODE_ENV === "production";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = loginSchema.parse(req.body);
  const user = await loginService(validatedInput);

  const tokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    data: user,
  });
});

export const logout = (req: Request, res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return res.status(200).json({
    success: true,
    data: { message: "Đăng xuất thành công" },
  });
};

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await getMeService(userId);
  return res.status(200).json({
    success: true,
    data: user,
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const validatedInput = changePasswordSchema.parse(req.body);
  const result = await changePasswordService(userId, validatedInput);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    throw new AppError("Refresh token không tồn tại", 401, "UNAUTHORIZED");
  }

  const payload = verifyRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken({
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
  });

  res.cookie("access_token", newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    data: { message: "Cấp lại access token thành công" },
  });
});
