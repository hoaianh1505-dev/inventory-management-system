import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRole } from "../constants";
import { hashPassword, comparePassword } from "../utils/password.util";
import { LoginInput, ChangePasswordInput, UpdateProfileInput } from "../validations/auth.validation";
import { AppError } from "../utils/appError.util";

const userRepository = AppDataSource.getRepository(User);

export const seedInitialAdmin = async (): Promise<void> => {
  try {
    const userCount = await userRepository.count();
    if (userCount === 0) {
      const hashedPassword = await hashPassword("admin123");
      await userRepository.save({
        username: "admin",
        password: hashedPassword,
        display_name: "Super Admin",
        phone: "0901234567",
        email: "admin@company.com",
        role: UserRole.ADMIN,
        must_change_password: false,
        is_active: true,
      });
      console.log("[SEED] Da tao tai khoan Super Admin mac dinh (username: admin, password: admin123)");
    }
  } catch (error) {
    console.error("[SEED] Loi khi tao tai khoan admin mac dinh:", error);
  }
};

export const loginService = async (input: LoginInput) => {
  const user = await userRepository.findOne({
    where: { username: input.username },
  });

  if (!user) {
    throw new AppError("Tên đăng nhập hoặc mật khẩu không đúng", 401, "UNAUTHORIZED");
  }

  if (!user.is_active) {
    throw new AppError("Tài khoản đã bị khóa", 403, "ACCOUNT_DISABLED");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Tên đăng nhập hoặc mật khẩu không đúng", 401, "UNAUTHORIZED");
  }

  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    must_change_password: user.must_change_password,
  };
};

export const getMeService = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
    select: ["id", "username", "display_name", "phone", "email", "avatar", "role", "must_change_password", "is_active", "created_at"],
  });

  if (!user) {
    throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
  }

  return user;
};

export const changePasswordService = async (
  userId: string,
  input: ChangePasswordInput
) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
  }

  const isOldPasswordValid = await comparePassword(input.old_password, user.password);
  if (!isOldPasswordValid) {
    throw new AppError("Mật khẩu cũ không đúng", 400, "INVALID_PASSWORD");
  }

  user.password = await hashPassword(input.new_password);
  user.must_change_password = false;
  await userRepository.save(user);

  return { message: "Đổi mật khẩu thành công" };
};

export const updateProfileService = async (
  userId: string,
  input: UpdateProfileInput
) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
  }

  if (input.display_name !== undefined) user.display_name = input.display_name || null;
  if (input.phone !== undefined) user.phone = input.phone || null;
  if (input.email !== undefined) user.email = input.email || null;
  if (input.avatar !== undefined) user.avatar = input.avatar || null;

  await userRepository.save(user);

  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    updated_at: user.updated_at,
  };
};
