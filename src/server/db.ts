import { Product, Order, User, TelegramConfig, NotificationLog, ProductReview } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockData';

// Persistent in-memory & LocalStorage store for orders, products, and logs
export interface StoreState {
  products: Product[];
  orders: Order[];
  users: User[];
  telegramConfig: TelegramConfig;
  notificationLogs: NotificationLog[];
  reviews: ProductReview[];
}

export const initialOrders: Order[] = [
  {
    id: '1001',
    orderNumber: '7X-1001',
    customerName: 'Tanvir Hossain',
    phone: '01712345678',
    email: 'tanvir.dev@gmail.com',
    address: 'House 14, Road 5, Block C, Mirpur-2',
    district: 'Dhaka',
    notes: 'Please call before delivery. Ring bell twice.',
    items: [
      {
        productId: 'prod-101',
        productName: '7X UltraWatch Pro 2.04" AMOLED Titanium Smartwatch',
        productImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
        price: 2850,
        quantity: 1,
        selectedColor: 'Midnight Black',
      },
    ],
    subtotal: 2850,
    deliveryFee: 0,
    discount: 0,
    totalAmount: 2850,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'shipped',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    telegramNotified: true,
    emailNotified: true,
  },
  {
    id: '1002',
    orderNumber: '7X-1002',
    customerName: 'Nusrat Jahan',
    phone: '01898765432',
    email: 'nusrat.jahan@yahoo.com',
    address: 'Flat 4B, Green Villa, Nasirabad Housing',
    district: 'Chittagong',
    notes: 'Office address, deliver between 10am to 5pm',
    items: [
      {
        productId: 'prod-102',
        productName: '7X SoundPods Pro ANC Wireless Earbuds',
        productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
        price: 2190,
        quantity: 1,
        selectedColor: 'Glossy White',
      },
      {
        productId: 'prod-103',
        productName: 'GaN III 65W Triple-Port Fast Wall Charger',
        productImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
        price: 1450,
        quantity: 1,
        selectedColor: 'Ceramic White',
      },
    ],
    subtotal: 3640,
    deliveryFee: 100,
    discount: 364,
    couponCode: '7XSPECIAL',
    totalAmount: 3376,
    paymentMethod: 'bkash',
    paymentStatus: 'completed',
    orderStatus: 'processing',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    telegramNotified: true,
    emailNotified: true,
  },
  {
    id: '1003',
    orderNumber: '7X-1003',
    customerName: 'Saiful Islam',
    phone: '01811534513',
    email: 'saif01811534513solima@gmail.com',
    address: 'House 8, Road 2, Sector 9, Uttara',
    district: 'Dhaka',
    notes: 'Urgent delivery needed if possible',
    items: [
      {
        productId: 'prod-104',
        productName: '7X Apex Pro Wireless RGB Mechanical Keyboard',
        productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
        price: 4290,
        quantity: 1,
        selectedColor: 'Retro White & Gray',
      },
    ],
    subtotal: 4290,
    deliveryFee: 0,
    discount: 100,
    couponCode: 'WELCOME100',
    totalAmount: 4190,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    telegramNotified: true,
    emailNotified: true,
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Admin Saif',
    email: 'saif01811534513solima@gmail.com',
    phone: '01811534513',
    role: 'admin',
    district: 'Dhaka',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr-cust-1',
    name: 'Tanvir Hossain',
    email: 'tanvir.dev@gmail.com',
    phone: '01712345678',
    role: 'customer',
    address: 'House 14, Road 5, Block C, Mirpur-2',
    district: 'Dhaka',
    createdAt: '2026-02-10T11:20:00Z',
  },
  {
    id: 'usr-cust-2',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@yahoo.com',
    phone: '01898765432',
    role: 'customer',
    address: 'Flat 4B, Green Villa, Nasirabad Housing',
    district: 'Chittagong',
    createdAt: '2026-02-18T14:40:00Z',
  }
];

export const initialReviews: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-101',
    customerName: 'Farhan Kabir',
    rating: 5,
    comment: 'The AMOLED screen is amazingly bright even under direct sunlight. Battery lasts well over 10 days! Great build quality.',
    date: '2026-03-12',
    verifiedPurchase: true,
  },
  {
    id: 'rev-2',
    productId: 'prod-101',
    customerName: 'Shakil Ahmed',
    rating: 5,
    comment: 'Best smartwatch in Bangladesh at this price point. Packaging was top-notch with bubble wrap.',
    date: '2026-03-20',
    verifiedPurchase: true,
  },
  {
    id: 'rev-3',
    productId: 'prod-102',
    customerName: 'Sadia Rahman',
    rating: 4.8,
    comment: 'The ANC really cuts out fan and traffic noise. Bass is punchy and microphone quality for office meetings is superb.',
    date: '2026-03-24',
    verifiedPurchase: true,
  },
];

export const defaultTelegramConfig: TelegramConfig = {
  // Pre-configured with realistic Telegram bot parameters or live configurable
  botToken: '7689234190:AAH-7xShopDemoBotTokenSecretKeyXYZ',
  chatId: '@shop7x_orders',
  enabled: true,
  lastTestedAt: new Date().toISOString(),
};

export const initialNotificationLogs: NotificationLog[] = [
  {
    id: 'log-1001',
    orderId: '1001',
    type: 'telegram',
    status: 'success',
    message: '🔔 New Order Received\n\nOrder ID: #1001\nCustomer Name: Tanvir Hossain\nPhone: 01712345678\nProduct: 7X UltraWatch Pro 2.04" AMOLED\nAmount: ৳2,850\nPayment: Cash on Delivery',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    details: 'Dispatched to Telegram Chat @shop7x_orders',
  },
  {
    id: 'log-1002',
    orderId: '1002',
    type: 'telegram',
    status: 'success',
    message: '🔔 New Order Received\n\nOrder ID: #1002\nCustomer Name: Nusrat Jahan\nPhone: 01898765432\nProduct: 7X SoundPods Pro ANC + GaN 65W Charger\nAmount: ৳3,376\nPayment: bKash Instant',
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    details: 'Dispatched to Telegram Chat @shop7x_orders',
  },
  {
    id: 'log-1003',
    orderId: '1003',
    type: 'telegram',
    status: 'success',
    message: '🔔 New Order Received\n\nOrder ID: #1003\nCustomer Name: Saiful Islam\nPhone: 01811534513\nProduct: 7X Apex Pro Wireless RGB Mechanical Keyboard\nAmount: ৳4,190\nPayment: Cash on Delivery',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    details: 'Dispatched to Telegram Chat @shop7x_orders',
  }
];
