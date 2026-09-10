import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "../constants";

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "ims_access_secret_key_default";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "ims_refresh_secret_key_default";

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};
