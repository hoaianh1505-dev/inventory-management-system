import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRole } from "../constants";
import { hashPassword, comparePassword } from "../utils/password.util";
import { LoginInput, ChangePasswordInput } from "../validations/auth.validation";

const userRepository = AppDataSource.getRepository(User);

export const seedInitialAdmin = async (): Promise<void> => {
  try {
    const userCount = await userRepository.count();
    if (userCount === 0) {
      const hashedPassword = await hashPassword("admin123");
      const adminUser = userRepository.create({
        username: "admin",
        password: hashedPassword,
        email: "admin@company.com",
        role: UserRole.ADMIN,
        must_change_password: false,
        is_active: true,
      });
      await userRepository.save(adminUser);
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
    const error: any = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  if (!user.is_active) {
    const error: any = new Error("Tài khoản đã bị khóa");
    error.statusCode = 403;
    error.code = "ACCOUNT_DISABLED";
    throw error;
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    must_change_password: user.must_change_password,
  };
};

export const getMeService = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
    select: ["id", "username", "email", "role", "must_change_password", "is_active", "created_at"],
  });

  if (!user) {
    const error: any = new Error("Người dùng không tồn tại");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
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
    const error: any = new Error("Người dùng không tồn tại");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const isOldPasswordValid = await comparePassword(input.old_password, user.password);
  if (!isOldPasswordValid) {
    const error: any = new Error("Mật khẩu cũ không đúng");
    error.statusCode = 400;
    error.code = "INVALID_PASSWORD";
    throw error;
  }

  user.password = await hashPassword(input.new_password);
  user.must_change_password = false;
  await userRepository.save(user);

  return { message: "Đổi mật khẩu thành công" };
};
