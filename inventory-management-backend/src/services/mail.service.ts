import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRole } from "../constants";
import { AppError } from "../utils/appError.util";
import {
  SendIndividualMailInput,
  BroadcastMailInput,
} from "../validations/mail.validation";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587");
const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || "";
const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || "";
const smtpFrom = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"IMS System" <anhd78428@gmail.com>`;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth:
    smtpUser && smtpPass
      ? {
          user: smtpUser,
          pass: smtpPass,
        }
      : undefined,
});

const userRepository = AppDataSource.getRepository(User);

export const sendIndividualMailService = async (input: SendIndividualMailInput) => {
  let targetEmail = input.email;
  let recipientName = "Nhân viên";

  if (input.user_id) {
    const user = await userRepository.findOne({ where: { id: input.user_id } });
    if (!user) {
      throw new AppError("Không tìm thấy người dùng", 404, "NOT_FOUND");
    }
    if (!user.email && !input.email) {
      throw new AppError("Người dùng này chưa cập nhật email", 400, "MISSING_EMAIL");
    }
    targetEmail = user.email || input.email;
    recipientName = user.display_name || user.username;
  }

  if (!targetEmail) {
    throw new AppError("Chưa có email người nhận", 400, "MISSING_EMAIL");
  }

  const mailOptions = {
    from: smtpFrom,
    to: targetEmail,
    subject: input.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2b6cb0; text-align: center;">📢 Thông báo từ Hệ thống Quản lý Kho IMS</h2>
        <hr style="border: none; border-top: 1px solid #edf2f7;" />
        <p>Kính gửi <strong>${recipientName}</strong>,</p>
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #3182ce; margin: 20px 0; line-height: 1.6;">
          ${input.message.replace(/\n/g, "<br />")}
        </div>
        <br />
        <p style="font-size: 12px; color: #a0aec0; text-align: center;">Đây là email tự động gửi từ ban quản trị hệ thống IMS.</p>
      </div>
    `,
  };

  if (!smtpUser || !smtpPass) {
    console.log(`[MOCK INDIVIDUAL MAIL] To: ${targetEmail} | Subject: ${input.subject}`);
    return {
      sent: true,
      mode: "MOCK",
      recipient: targetEmail,
      message: "Email đã được giả lập gửi thành công (Do chưa cấu hình SMTP credentials trong .env)",
    };
  }

  const info = await transporter.sendMail(mailOptions);
  return {
    sent: true,
    mode: "SMTP",
    messageId: info.messageId,
    recipient: targetEmail,
  };
};

export const broadcastMailService = async (input: BroadcastMailInput) => {
  const whereClause: any = { is_active: true };

  if (input.target_role !== "ALL") {
    whereClause.role = input.target_role as UserRole;
  }

  const users = await userRepository.find({
    where: whereClause,
    select: ["id", "username", "display_name", "email"],
  });

  const emailsWithAddress = users.filter((u) => u.email && u.email.trim().length > 0);

  if (emailsWithAddress.length === 0) {
    throw new AppError("Không tìm thấy nhân viên nào có email hợp lệ để gửi", 400, "NO_VALID_RECIPIENTS");
  }

  const recipientEmails = emailsWithAddress.map((u) => u.email!);

  const mailOptions = {
    from: smtpFrom,
    to: recipientEmails.join(", "),
    subject: input.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #dd6b20; text-align: center;">📢 THÔNG BÁO CHUNG HỆ THỐNG KHO</h2>
        <hr style="border: none; border-top: 1px solid #edf2f7;" />
        <div style="background-color: #fffaf0; padding: 15px; border-left: 4px solid #dd6b20; margin: 20px 0; line-height: 1.6;">
          ${input.message.replace(/\n/g, "<br />")}
        </div>
        <p style="font-size: 12px; color: #a0aec0; text-align: center;">Thông báo này được gửi tới toàn bộ nhóm nhân viên [${input.target_role}].</p>
      </div>
    `,
  };

  if (!smtpUser || !smtpPass) {
    console.log(`[MOCK BROADCAST MAIL] Target count: ${recipientEmails.length} | Subject: ${input.subject}`);
    return {
      sent: true,
      mode: "MOCK",
      totalRecipients: recipientEmails.length,
      recipients: recipientEmails,
      message: `Đã giả lập gửi thông báo thành công tới ${recipientEmails.length} nhân viên.`,
    };
  }

  const info = await transporter.sendMail(mailOptions);
  return {
    sent: true,
    mode: "SMTP",
    messageId: info.messageId,
    totalRecipients: recipientEmails.length,
    recipients: recipientEmails,
  };
};

export const verifyMailConnectionService = async () => {
  if (!smtpUser || !smtpPass) {
    return {
      connected: false,
      mode: "MOCK",
      message: "Đang chạy ở chế độ MOCK (Chưa điền SMTP_USER / SMTP_PASS trong .env)",
    };
  }

  try {
    await transporter.verify();
    return {
      connected: true,
      mode: "SMTP",
      smtpHost,
      smtpPort,
      message: "Kết nối tới Mail Server SMTP thành công!",
    };
  } catch (error: any) {
    return {
      connected: false,
      mode: "SMTP_ERROR",
      error: error.message || "Không thể kết nối Mail Server",
    };
  }
};
