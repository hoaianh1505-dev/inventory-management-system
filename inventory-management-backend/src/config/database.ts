import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import {
  User,
  Category,
  Unit,
  Supplier,
  Product,
  ProductImage,
  Warehouse,
  WarehouseLocation,
  Inventory,
  StockTransaction,
  StockTransactionItem,
  AuditLog,
} from "../entities";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const useSSL =
  process.env.DB_SSL === "true" ||
  process.env.DB_HOST?.includes("supabase") ||
  process.env.DATABASE_URL?.includes("supabase");

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: "postgres",
        url: process.env.DATABASE_URL,
        synchronize: !isProduction, // Chỉ tự động sync schema khi dev, tắt ở prod để an toàn dữ liệu
        logging: false,
        entities: [
          User,
          Category,
          Unit,
          Supplier,
          Product,
          ProductImage,
          Warehouse,
          WarehouseLocation,
          Inventory,
          StockTransaction,
          StockTransactionItem,
          AuditLog,
        ],
        ssl: useSSL ? { rejectUnauthorized: false } : false,
        extra: {
          max: parseInt(process.env.DB_POOL_MAX || "20", 10),
          min: parseInt(process.env.DB_POOL_MIN || "5", 10),
          idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || "30000", 10),
        },
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_DATABASE || "ims_db",
        synchronize: !isProduction, // Chỉ tự động sync schema khi dev, tắt ở prod để an toàn dữ liệu
        logging: false,
        entities: [
          User,
          Category,
          Unit,
          Supplier,
          Product,
          ProductImage,
          Warehouse,
          WarehouseLocation,
          Inventory,
          StockTransaction,
          StockTransactionItem,
          AuditLog,
        ],
        ssl: useSSL ? { rejectUnauthorized: false } : false,
        extra: {
          max: parseInt(process.env.DB_POOL_MAX || "20", 10),
          min: parseInt(process.env.DB_POOL_MIN || "5", 10),
          idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || "30000", 10),
        },
      }
);
