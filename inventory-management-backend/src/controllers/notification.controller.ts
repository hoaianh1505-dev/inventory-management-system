import { Request, Response, NextFunction } from "express";
import {
  emitRealtimeNotification,
  emitLowStockNotification,
  emitStockTransactionNotification,
  getSocketStats,
} from "../config/socket.config";
import { broadcastNotificationSchema } from "../validations/notification.validation";

export const broadcastNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = broadcastNotificationSchema.parse(req.body);

    const success = emitRealtimeNotification(
      {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        data: validatedData.data,
      },
      validatedData.targetRoom
    );

    res.status(200).json({
      status: "success",
      message: "Đã phát thông báo Realtime qua WebSocket thành công",
      data: {
        sent: success,
        payload: validatedData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { alertType, customMessage } = req.body;

    if (alertType === "low_stock") {
      emitLowStockNotification({
        productId: "prod_demo_123",
        productName: "Laptop Dell XPS 13 Demo",
        sku: "LAP-DELL-XPS13-DEMO",
        warehouseName: "Kho Hà Nội Main",
        currentQuantity: 3,
        minThreshold: 10,
      });
    } else if (alertType === "stock_transaction") {
      emitStockTransactionNotification({
        transactionId: "tx_demo_9999",
        type: "IMPORT",
        warehouseId: "wh_hanoi_1",
        referenceNo: "#TEST-IMP-2026",
        itemsCount: 55,
        userName: req.user?.username || "Admin Kho",
      });
    } else {
      emitRealtimeNotification({
        type: "INFO",
        title: "⚡ TEST REALTIME SOCKET NOTIFICATION",
        message:
          customMessage ||
          "Kết nối Realtime WebSocket Hệ thống Quản lý Kho Hàng IMS đang hoạt động tốt!",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Đã gửi thông báo thử nghiệm thành công qua WebSocket",
      alertType: alertType || "general",
    });
  } catch (error) {
    next(error);
  }
};

export const getSocketStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getSocketStats();
    res.status(200).json({
      status: "success",
      data: {
        serverTime: new Date().toISOString(),
        ...stats,
      },
    });
  } catch (error) {
    next(error);
  }
};
