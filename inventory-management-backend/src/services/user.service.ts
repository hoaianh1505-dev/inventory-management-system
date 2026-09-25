import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { hashPassword, generateTempPassword } from "../utils/password.util";
import {
  CreateUserInput,
  UpdateUserInput,
  QueryUserInput,
} from "../validations/user.validation";
import { ILike } from "typeorm";
import { AppError } from "../utils/appError.util";
import { sendNewUserEmail, sendResetPasswordEmail } from "../utils/mail.util";

const userRepository = AppDataSource.getRepository(User);

export const createUserService = async (input: CreateUserInput) => {
  const existingUser = await userRepository.findOne({
    where: { username: input.username },
  });

  if (existingUser) {
    throw new AppError("Tên đăng nhập đã tồn tại", 409, "DUPLICATE_USERNAME");
  }

  const tempPassword = generateTempPassword(8);
  const hashedPassword = await hashPassword(tempPassword);

  const newUser = await userRepository.save({
    username: input.username,
    display_name: input.display_name || null,
    phone: input.phone || null,
    email: input.email || null,
    avatar: input.avatar || null,
    password: hashedPassword,
    role: input.role,
    must_change_password: true,
    is_active: true,
  });

  if (newUser.email) {
    sendNewUserEmail({
      to: newUser.email,
      username: newUser.username,
      tempPassword,
      displayName: newUser.display_name,
    }).catch((err) => console.error("[MAIL_ERROR] Failed to send new user email:", err));
  }

  return {
    user: {
      id: newUser.id,
      username: newUser.username,
      display_name: newUser.display_name,
      phone: newUser.phone,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
      must_change_password: newUser.must_change_password,
      is_active: newUser.is_active,
      created_at: newUser.created_at,
    },
    temp_password: tempPassword,
  };
};

export const getUsersService = async (query: QueryUserInput) => {
  const { page, limit, role, is_active, search } = query;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (role) {
    whereClause.role = role;
  }

  if (typeof is_active === "boolean") {
    whereClause.is_active = is_active;
  }

  if (search) {
    whereClause.username = ILike(`%${search}%`);
  }

  const [users, total] = await userRepository.findAndCount({
    where: whereClause,
    select: ["id", "username", "display_name", "phone", "email", "avatar", "role", "must_change_password", "is_active", "created_at"],
    order: { created_at: "DESC" },
    skip,
    take: limit,
  });

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const getUserByIdService = async (id: string) => {
  const user = await userRepository.findOne({
    where: { id },
    select: ["id", "username", "display_name", "phone", "email", "avatar", "role", "must_change_password", "is_active", "created_at"],
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "NOT_FOUND");
  }

  return user;
};

export const updateUserService = async (id: string, input: UpdateUserInput) => {
  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "NOT_FOUND");
  }

  if (input.display_name !== undefined) user.display_name = input.display_name || null;
  if (input.phone !== undefined) user.phone = input.phone || null;
  if (input.email !== undefined) user.email = input.email || null;
  if (input.avatar !== undefined) user.avatar = input.avatar || null;
  if (input.role !== undefined) user.role = input.role;
  if (input.is_active !== undefined) user.is_active = input.is_active;

  await userRepository.save(user);

  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    is_active: user.is_active,
    updated_at: user.updated_at,
  };
};

export const resetPasswordService = async (id: string) => {
  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "NOT_FOUND");
  }

  const newTempPassword = generateTempPassword(8);
  user.password = await hashPassword(newTempPassword);
  user.must_change_password = true;

  await userRepository.save(user);

  if (user.email) {
    sendResetPasswordEmail({
      to: user.email,
      username: user.username,
      tempPassword: newTempPassword,
    }).catch((err) => console.error("[MAIL_ERROR] Failed to send reset password email:", err));
  }

  return {
    message: "Reset mật khẩu thành công",
    temp_password: newTempPassword,
  };
};

export const deleteUserService = async (id: string) => {
  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "NOT_FOUND");
  }

  await userRepository.softDelete(id);

  return { message: "Xóa tài khoản người dùng thành công" };
};
