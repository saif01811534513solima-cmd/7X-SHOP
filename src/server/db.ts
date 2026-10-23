import { Product, Order, User, TelegramConfig, NotificationLog, ProductReview } from '../types';

export interface StoreState {
  products: Product[];
  orders: Order[];
  users: User[];
  telegramConfig: TelegramConfig;
  notificationLogs: NotificationLog[];
  reviews: ProductReview[];
}

// Clean production-ready zero-fake initialization (no demo orders, no fake customers)
export const initialOrders: Order[] = [];
export const initialUsers: User[] = [];
export const initialReviews: ProductReview[] = [];

export const defaultTelegramConfig: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || '',
  enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  lastTestedAt: new Date().toISOString(),
};

export const initialNotificationLogs: NotificationLog[] = [];
