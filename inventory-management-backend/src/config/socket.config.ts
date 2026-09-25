import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { corsOptions } from "./security.config";

let io: Server | null = null;

export interface RealtimeNotificationPayload {
  id?: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "DANGER" | "STOCK_TRANSACTION" | "LOW_STOCK";
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp?: string;
}

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin || "*",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`⚡ Realtime WebSocket Client Connected: [${socket.id}]`);

    // Default join global room
    socket.join("global_room");

    // Client join specific warehouse or admin room
    socket.on("join_room", (roomName: string) => {
      socket.join(roomName);
      console.log(`Client [${socket.id}] joined room: ${roomName}`);
      socket.emit("joined_room_ack", { room: roomName, status: "success" });
    });

    // Client ping/pong test
    socket.on("ping_server", (data?: any) => {
      socket.emit("pong_client", {
        message: "Realtime Notification Socket Server is active!",
        time: new Date().toISOString(),
        received: data,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client [${socket.id}] disconnected. Reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

/**
  Broadcast a realtime notification to all connected clients or a specific room
 */
export const emitRealtimeNotification = (
  payload: RealtimeNotificationPayload,
  targetRoom: string = "global_room"
) => {
  if (!io) {
    console.warn("⚠️ Cannot emit realtime notification: Socket.io server not initialized");
    return false;
  }

  const notificationData = {
    id: payload.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type: payload.type || "INFO",
    title: payload.title,
    message: payload.message,
    data: payload.data || {},
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  io.to(targetRoom).emit("notification", notificationData);
  console.log(`📢 [REALTIME NOTIFICATION] Sent to [${targetRoom}]: ${payload.title}`);
  return true;
};

/**
  Emit stock transaction event
 */
export const emitStockTransactionNotification = (transactionData: {
  transactionId: string;
  type: string;
  warehouseId: string;
  referenceNo?: string;
  itemsCount: number;
  userName?: string;
}) => {
  const typeText =
    transactionData.type === "IMPORT"
      ? "Nhập kho"
      : transactionData.type === "EXPORT"
      ? "Xuất kho"
      : transactionData.type === "TRANSFER"
      ? "Chuyển kho"
      : "Kiểm kê";

  emitRealtimeNotification({
    type: "STOCK_TRANSACTION",
    title: `📦 Phát sinh Giao dịch ${typeText}`,
    message: `Giao dịch ${transactionData.referenceNo || transactionData.transactionId} vừa được khởi tạo với ${transactionData.itemsCount} mặt hàng.`,
    data: transactionData,
  });
};

/**
  Emit low stock warning
 */
export const emitLowStockNotification = (alertData: {
  productId: string;
  productName: string;
  sku: string;
  warehouseName: string;
  currentQuantity: number;
  minThreshold: number;
}) => {
  emitRealtimeNotification({
    type: "LOW_STOCK",
    title: `⚠️ CẢNH BÁO TỒN KHO THẤP!`,
    message: `Sản phẩm ${alertData.productName} (${alertData.sku}) tại ${alertData.warehouseName} chỉ còn ${alertData.currentQuantity} (Dưới ngưỡng ${alertData.minThreshold}).`,
    data: alertData,
  });
};

/**
  Get stats of connected sockets
 */
export const getSocketStats = async () => {
  if (!io) {
    return { activeConnections: 0, rooms: [] };
  }
  const sockets = await io.fetchSockets();
  return {
    activeConnections: sockets.length,
    connectedSocketIds: sockets.map((s) => s.id),
  };
};
