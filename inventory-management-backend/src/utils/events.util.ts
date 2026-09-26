import { EventEmitter } from "events";

export const appEvents = new EventEmitter();

export const SYSTEM_EVENTS = {
  USER_CREATED: "user.created",
  PASSWORD_RESET: "user.password_reset",
  LOW_STOCK_ALERT: "inventory.low_stock",
};
