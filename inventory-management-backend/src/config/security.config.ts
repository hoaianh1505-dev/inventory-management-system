import rateLimit from "express-rate-limit";
import { CorsOptions } from "cors";

// CORS Security Configuration
export const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// General Rate Limiter (Max 300 requests per 15 minutes per IP)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.",
    },
  },
});

// Strict Rate Limiter for Authentication routes (Max 10 login attempts per 15 minutes)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    },
  },
});
