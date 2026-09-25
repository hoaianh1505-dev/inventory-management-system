import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587");
const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || "";
const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || "";
const smtpFrom = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"IMS System" <anhd78428@gmail.com>`;

// Create reusable Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth:
    smtpUser && smtpPass
      ? {
          user: smtpUser,
          pass: smtpPass,
        }
      : undefined,
});

export interface SendNewUserEmailParams {
  to: string;
  username: string;
  tempPassword: string;
  displayName?: string | null;
}

export interface SendResetPasswordEmailParams {
  to: string;
  username: string;
  tempPassword: string;
}

/**
  Gửi email chào mừng & cấp tài khoản/mật khẩu tạm cho nhân viên mới
 */
export const sendNewUserEmail = async (params: SendNewUserEmailParams): Promise<boolean> => {
  const { to, username, tempPassword, displayName } = params;
  const name = displayName || username;

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: "🔑 [Hệ thống IMS] Thông tin Tài khoản & Mật khẩu khởi tạo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2b6cb0; text-align: center;">Hệ thống Quản lý Kho Hàng IMS</h2>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Tài khoản của bạn trên hệ thống Quản lý Kho Hàng IMS đã được khởi tạo thành công bởi Quản trị viên.</p>
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #3182ce; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Tên đăng nhập:</strong> <code style="font-size: 16px; color: #2d3748;">${username}</code></p>
          <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <code style="font-size: 16px; color: #e53e3e;">${tempPassword}</code></p>
        </div>
        <p style="color: #e53e3e; font-weight: bold;">⚠️ Lưu ý quan trọng:</p>
        <p>Đây là mật khẩu tạm thời. Ở lần đăng nhập đầu tiên, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu cá nhân mới để đảm bảo an toàn.</p>
        <br />
        <p style="font-size: 12px; color: #a0aec0; text-align: center;">Email này được tự động gửi từ Hệ thống IMS. Vui lòng không trả lời email này.</p>
      </div>
    `,
  };

  try {
    if (!smtpUser || !smtpPass) {
      console.log(`[MOCK EMAIL SENT] To: ${to} | Username: ${username} | TempPassword: ${tempPassword}`);
      return true;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi gửi email:", error);
    return false;
  }
};

/**
  Gửi email thông báo Reset mật khẩu cho nhân viên
 */
export const sendResetPasswordEmail = async (
  params: SendResetPasswordEmailParams
): Promise<boolean> => {
  const { to, username, tempPassword } = params;

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: "🔄 [Hệ thống IMS] Đặt lại Mật khẩu Tài khoản",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #dd6b20; text-align: center;">Hệ thống Quản lý Kho Hàng IMS</h2>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Mật khẩu tài khoản của bạn vừa được Quản trị viên reset thành công.</p>
        <div style="background-color: #fffaf0; padding: 15px; border-left: 4px solid #dd6b20; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Tên đăng nhập:</strong> <code>${username}</code></p>
          <p style="margin: 5px 0;"><strong>Mật khẩu mới tạm thời:</strong> <code style="font-size: 16px; color: #e53e3e;">${tempPassword}</code></p>
        </div>
        <p>Vui lòng dùng mật khẩu mới này để đăng nhập và tiến hành đổi mật khẩu cá nhân.</p>
      </div>
    `,
  };

  try {
    if (!smtpUser || !smtpPass) {
      console.log(`[MOCK EMAIL RESET SENT] To: ${to} | Username: ${username} | TempPassword: ${tempPassword}`);
      return true;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [EMAIL RESET SENT] MessageId: ${info.messageId} to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi gửi email reset mật khẩu:", error);
    return false;
  }
};
