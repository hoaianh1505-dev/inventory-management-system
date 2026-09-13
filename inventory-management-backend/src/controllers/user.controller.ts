import { Request, Response } from "express";
import {
  createUserSchema,
  updateUserSchema,
  queryUserSchema,
} from "../validations/user.validation";
import {
  createUserService,
  getUsersService,
  getUserByIdService,
  updateUserService,
  resetPasswordService,
  deleteUserService,
} from "../services/user.service";
import { UserRole } from "../constants";
import { asyncHandler } from "../utils/asyncHandler.util";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = createUserSchema.parse(req.body);
  const result = await createUserService(validatedInput);
  return res.status(201).json({
    success: true,
    data: result,
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = queryUserSchema.parse(req.query);
  const result = await getUsersService(validatedQuery);
  return res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserByIdService(id);
  return res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedInput = updateUserSchema.parse(req.body);
  const result = await updateUserService(id, validatedInput);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await resetPasswordService(id);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteUserService(id);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

export const getRoles = (req: Request, res: Response) => {
  const roles = [
    { code: UserRole.ADMIN, name: "Quản trị viên" },
    { code: UserRole.MANAGER, name: "Quản lý kho" },
    { code: UserRole.STAFF, name: "Nhân viên kho" },
  ];
  return res.status(200).json({
    success: true,
    data: roles,
  });
};
