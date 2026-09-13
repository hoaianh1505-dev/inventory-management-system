import { Request, Response, NextFunction } from "express";
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

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedInput = createUserSchema.parse(req.body);
    const result = await createUserService(validatedInput);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryUserSchema.parse(req.query);
    const result = await getUsersService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedInput = updateUserSchema.parse(req.body);
    const result = await updateUserService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await resetPasswordService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deleteUserService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

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
