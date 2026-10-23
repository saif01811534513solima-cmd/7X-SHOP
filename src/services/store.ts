import { useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  User, 
  CartItem, 
  Category, 
  TelegramConfig, 
  NotificationLog, 
  ProductReview, 
  Language, 
  Currency,
  Coupon,
  PaymentSettings,
  SiteSettings,
  HeroSlide,
  OrderStatus
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  DEFAULT_SITE_SETTINGS 
} from '../data/mockData';
import { defaultTelegramConfig } from '../server/db';
import { translations } from '../utils/translations';

// Web Audio API order chime
export function playOrderNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: G#5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.15);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);

    // Note 3: B5
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(987.77, now + 0.3);
    gain3.gain.setValueAtTime(0.3, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.85);
  } catch {
    // Audio context may be blocked prior to user interaction
  }
}

// Strictly UI preferences only in localStorage
const STORAGE_KEYS = {
  CART: '7x_shop_cart_v2',
  LANGUAGE: '7x_shop_lang_v2',
  CURRENCY: '7x_shop_curr_v2',
  ADMIN_PASSWORD_CHANGED: '7x_shop_admin_password_changed_v2',
};

// Legacy keys to clean up from customer browsers
const LEGACY_STORAGE_KEYS = [
  '7x_shop_products_v1',
  '7x_shop_orders_v1',
  '7x_shop_users_v1',
  '7x_shop_current_user_v1',
  '7x_shop_tg_config_v1',
  '7x_shop_tg_logs_v1',
  '7x_shop_reviews_v1',
  '7x_shop_payment_settings_v1',
  '7x_shop_site_settings_v1',
  '7x_shop_admin_password_v1',
];

export const defaultPaymentSettings: PaymentSettings = {
  cod: {
    enabled: true,
    labelEn: 'Cash on Delivery (COD)',
    labelBn: 'ক্যাশ অন ডেলিভারি (COD)',
    instructionsEn: 'Pay with cash upon physical doorstep parcel inspection.',
    instructionsBn: 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করুন।',
  },
  bkash: {
    enabled: true,
    number: '01811-534513',
    accountType: 'Personal',
    instructionsEn: 'Send Money to our bKash number and enter TrxID.',
    instructionsBn: 'আমাদের বিকাশ নম্বরে সেন্ড মানি করে TrxID প্রদান করুন।',
  },
  nagad: {
    enabled: true,
    number: '01811-534513',
    accountType: 'Personal',
    instructionsEn: 'Send Money to our Nagad number and enter TrxID.',
    instructionsBn: 'আমাদের নগদ নম্বরে সেন্ড মানি করে TrxID প্রদান করুন।',
  },
  rocket: {
    enabled: true,
    number: '01811-534513',
    accountType: 'Personal',
    instructionsEn: 'Send Money to our Rocket number and enter TrxID.',
    instructionsBn: 'আমাদের রকেট নম্বরে সেন্ড মানি করে TrxID প্রদান করুন।',
  },
  card: {
    enabled: false,
    labelEn: 'Debit / Credit Card (Visa, Mastercard, Amex)',
    labelBn: 'ডেবিট / ক্রেডিট কার্ড (Visa, Mastercard, Amex)',
    gatewayName: '3D Secure 2.0 Gateway (Temporarily Offline)',
  },
};

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export class ShopStateService {
  private static instance: ShopStateService;
  private listeners: Set<() => void> = new Set();

  // Server-authoritative data models
  public products: Product[] = [...INITIAL_PRODUCTS];
  public categories: Category[] = [...INITIAL_CATEGORIES];
  public orders: Order[] = [];
  public users: User[] = [];
  public currentUser: User | null = null;
  public telegramConfig: TelegramConfig = { ...defaultTelegramConfig };
  public notificationLogs: NotificationLog[] = [];
  public reviews: ProductReview[] = [];
  public siteSettings: SiteSettings = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
  public adminStats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
  } | null = null;

  // Client-side UI Preferences (kept in localStorage)
  public cart: CartItem[];
  public language: Language;
  public currency: Currency;
  public paymentSettings: PaymentSettings = { ...defaultPaymentSettings };
  public appliedCoupon: Coupon | null = null;
  public liveToast: { title: string; message: string; type: 'success' | 'info' | 'order' } | null = null;
  public adminPasswordChangedAt: string;
  public adminUnlocked: boolean = false;
  public adminToken: string | null = null;

  private constructor() {
    // Purge obsolete data keys from localStorage
    if (typeof window !== 'undefined') {
      LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    }

    // Load purely UI preferences
    this.cart = getStoredItem<CartItem[]>(STORAGE_KEYS.CART, []);
    this.language = getStoredItem<Language>(STORAGE_KEYS.LANGUAGE, 'en');
    this.currency = getStoredItem<Currency>(STORAGE_KEYS.CURRENCY, 'BDT');
    this.adminPasswordChangedAt = getStoredItem<string>(STORAGE_KEYS.ADMIN_PASSWORD_CHANGED, '2026-01-01T00:00:00.000Z');

    this.adminUnlocked = typeof window !== 'undefined' ? sessionStorage.getItem('7x_shop_admin_unlocked') === 'true' : false;
    this.adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('7x_shop_admin_token') : null;

    // Load server-side data on initialization
    if (typeof window !== 'undefined') {
      this.loadInitialData().catch(err => {
        console.warn('Initial data load warning:', err);
      });
      if (this.adminUnlocked && this.adminToken) {
        this.loadAdminData().catch(() => {});
      }
    }
  }

  // ----------------------------------------------------
  // Server-authoritative data loading (Single Source of Truth)
  // ----------------------------------------------------
  public async loadInitialData(): Promise<void> {
    await Promise.allSettled([
      this.loadProducts(),
      this.loadCategories(),
      this.loadSiteSettings(),
    ]);
  }

  public async loadProducts(): Promise<void> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.products = json.data;
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Failed to fetch products from server:', err);
    }
  }

  public async loadCategories(): Promise<void> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.categories = json.data;
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Failed to fetch categories from server:', err);
    }
  }

  public async loadSiteSettings(): Promise<void> {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.siteSettings = json.data;
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Failed to fetch site settings from server:', err);
    }
  }

  public async loadReviews(productId: string): Promise<ProductReview[]> {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const others = this.reviews.filter(r => r.productId !== productId);
          this.reviews = [...json.data, ...others];
          this.notify();
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch product reviews from server:', err);
    }
    return [];
  }

  // ----------------------------------------------------
  // Admin Server-Side Data Loaders (orders, customers, stats, telegram logs)
  // ----------------------------------------------------
  public async loadAdminData(): Promise<void> {
    if (!this.adminToken) return;
    await Promise.allSettled([
      this.loadOrders(),
      this.loadCustomers(),
      this.loadAdminStats(),
      this.loadTelegramConfig(),
      this.loadTelegramLogs(),
    ]);
  }

  public async loadOrders(): Promise<void> {
    if (!this.adminToken) return;
    try {
      const res = await this.apiFetch('/api/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        this.orders = json.data;
        this.notify();
      }
    } catch (err) {
      console.warn('Admin orders load error:', err);
    }
  }

  public async loadCustomers(): Promise<void> {
    if (!this.adminToken) return;
    try {
      const res = await this.apiFetch('/api/customers');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        this.users = json.data;
        this.notify();
      }
    } catch (err) {
      console.warn('Admin customers load error:', err);
    }
  }

  public async loadAdminStats(): Promise<void> {
    if (!this.adminToken) return;
    try {
      const res = await this.apiFetch('/api/admin/stats');
      const json = await res.json();
      if (json.success && json.data) {
        this.adminStats = json.data;
        this.notify();
      }
    } catch (err) {
      console.warn('Admin stats load error:', err);
    }
  }

  public async loadTelegramConfig(): Promise<void> {
    if (!this.adminToken) return;
    try {
      const res = await this.apiFetch('/api/telegram/config');
      const json = await res.json();
      if (json.success && json.data) {
        this.telegramConfig = json.data;
        this.notify();
      }
    } catch (err) {
      console.warn('Admin telegram config load error:', err);
    }
  }

  public async loadTelegramLogs(): Promise<void> {
    if (!this.adminToken) return;
    try {
      const res = await this.apiFetch('/api/telegram/logs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        this.notificationLogs = json.data;
        this.notify();
      }
    } catch (err) {
      console.warn('Admin telegram logs load error:', err);
    }
  }

  // ----------------------------------------------------
  // Centralized authenticated API Fetch helper
  // ----------------------------------------------------
  public async apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (this.adminToken) {
      headers.set('x-admin-token', this.adminToken);
    }

    let res: Response;
    try {
      res = await fetch(url, { ...options, headers });
    } catch (networkErr: any) {
      const errorMsg = networkErr?.message || 'Network connection failed';
      this.showToast('Network Error', errorMsg, 'info');
      throw networkErr;
    }

    if (res.status === 401) {
      if (this.adminUnlocked || this.adminToken) {
        this.lockAdmin();
        this.showToast(
          this.language === 'bn' ? 'সেশন সমাপ্ত' : 'Session Expired',
          this.language === 'bn' ? 'আপনার এডমিন সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।' : 'Your admin session has expired. Please log in again.',
          'info'
        );
      }
      const errData = await res.clone().json().catch(() => ({}));
      const error = new Error(errData.message || 'Unauthorized: Admin authentication required');
      throw error;
    }

    if (!res.ok) {
      const errData = await res.clone().json().catch(() => ({}));
      const error = new Error(errData.message || `Request failed with status ${res.status}`);
      throw error;
    }

    return res;
  }

  // Customer order tracking by orderNumber and exact phone
  public async trackOrder(orderNumber: string, phone: string): Promise<{
    success: boolean;
    data?: {
      orderNumber: string;
      status: Order['orderStatus'];
      items: Array<{
        productName: string;
        productImage?: string;
        price: number;
        quantity: number;
        selectedColor?: string;
        selectedSize?: string;
      }>;
      total: number;
      createdAt: string;
    };
    message?: string;
  }> {
    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to connect to tracking service',
      };
    }
  }

  public static getInstance(): ShopStateService {
    if (!ShopStateService.instance) {
      ShopStateService.instance = new ShopStateService();
    }
    return ShopStateService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // Language & Currency
  public setLanguage(lang: Language): void {
    this.language = lang;
    setStoredItem(STORAGE_KEYS.LANGUAGE, lang);
    this.notify();
  }

  public setCurrency(curr: Currency): void {
    this.currency = curr;
    setStoredItem(STORAGE_KEYS.CURRENCY, curr);
    this.notify();
  }

  public formatPrice(bdtAmount: number): string {
    if (this.currency === 'USD') {
      const usd = (bdtAmount / 120).toFixed(2);
      return `$${usd}`;
    }
    return `৳${bdtAmount.toLocaleString('en-US')}`;
  }

  public t(): typeof translations.en {
    return translations[this.language] || translations.en;
  }

  // Toast
  public showToast(title: string, message: string, type: 'success' | 'info' | 'order' = 'info'): void {
    this.liveToast = { title, message, type };
    this.notify();
    setTimeout(() => {
      if (this.liveToast?.message === message) {
        this.liveToast = null;
        this.notify();
      }
    }, 5000);
  }

  // Payment Settings
  public updatePaymentSettings(settings: PaymentSettings): void {
    this.paymentSettings = { ...settings };
    this.notify();
  }

  // Cart operations (purely client UI state)
  public addToCart(product: Product, quantity = 1, selectedColor?: string, selectedSize?: string): void {
    const existingIndex = this.cart.findIndex(
      item =>
        item.product.id === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        product,
        quantity,
        selectedColor: selectedColor || product.colors?.[0],
        selectedSize: selectedSize || product.sizes?.[0],
      });
    }

    setStoredItem(STORAGE_KEYS.CART, this.cart);
    this.showToast(
      this.language === 'bn' ? 'কার্টে যুক্ত হয়েছে' : 'Added to Cart',
      `${product.nameEn} (${quantity})`
    );
    this.notify();
  }

  public updateCartQuantity(index: number, quantity: number): void {
    if (quantity <= 0) {
      this.cart.splice(index, 1);
    } else {
      this.cart[index].quantity = quantity;
    }
    setStoredItem(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    setStoredItem(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public clearCart(): void {
    this.cart = [];
    this.appliedCoupon = null;
    setStoredItem(STORAGE_KEYS.CART, []);
    this.notify();
  }

  // Server-side Coupon validation (Single Source of Truth)
  public async applyCoupon(code: string): Promise<{ success: boolean; message: string }> {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code' };
    }

    try {
      const res = await fetch(`/api/coupons/validate/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (data.success && data.data) {
        this.appliedCoupon = data.data;
        this.notify();
        return { 
          success: true, 
          message: this.language === 'bn' ? data.data.descriptionBn : data.data.descriptionEn 
        };
      }

      return { 
        success: false, 
        message: data.message || (this.language === 'bn' ? 'অবৈধ কুপন কোড' : 'Invalid promo coupon code') 
      };
    } catch {
      return { 
        success: false, 
        message: 'Could not connect to coupon verification server' 
      };
    }
  }

  public removeCoupon(): void {
    this.appliedCoupon = null;
    this.notify();
  }

  public getCartSubtotal(): number {
    return this.cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }

  public getCartDiscount(subtotal: number): number {
    if (!this.appliedCoupon) return 0;
    if (this.appliedCoupon.minSpend && subtotal < this.appliedCoupon.minSpend) return 0;
    if (this.appliedCoupon.discountType === 'percentage') {
      return Math.round((subtotal * this.appliedCoupon.discountValue) / 100);
    }
    if (this.appliedCoupon.discountType === 'fixed') {
      return this.appliedCoupon.discountValue;
    }
    return 0;
  }

  public getCartDeliveryFee(subtotal: number, district?: string): number {
    if (this.cart.length === 0) return 0;
    if (this.appliedCoupon?.discountType === 'free_shipping') return 0;
    const threshold = this.siteSettings?.freeDeliveryThreshold ?? 2000;
    if (subtotal >= threshold) return 0;
    if (district && district.trim().toLowerCase() !== 'dhaka') {
      return this.siteSettings?.outsideDhakaDeliveryFee ?? 120;
    }
    return this.siteSettings?.insideDhakaDeliveryFee ?? 60;
  }

  public getCartTotal(district?: string): number {
    const subtotal = this.getCartSubtotal();
    const discount = this.getCartDiscount(subtotal);
    const fee = this.getCartDeliveryFee(subtotal, district);
    return Math.max(0, subtotal - discount + fee);
  }

  // ----------------------------------------------------
  // Order Placement (Server-Authoritative)
  // ----------------------------------------------------
  public async placeOrder(orderData: {
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    notes?: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
    mfsProvider?: 'bkash' | 'nagad' | 'rocket';
    trxId?: string;
    senderNumber?: string;
    couponCode?: string;
  }): Promise<Order> {
    if (this.cart.length === 0) {
      throw new Error('Your cart is empty');
    }

    const payload = {
      ...orderData,
      couponCode: this.appliedCoupon?.code || orderData.couponCode,
      items: this.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Server rejected order creation');
    }

    const verifiedOrder: Order = json.data;

    // Refresh products catalog from server to reflect stock decrements
    await this.loadProducts();

    // Clear client cart
    this.clearCart();

    // Sound chime
    playOrderNotificationChime();

    this.showToast(
      '🔔 Order Placed!',
      `Order #${verifiedOrder.orderNumber || verifiedOrder.id} confirmed. Total: ৳${verifiedOrder.totalAmount.toLocaleString()}`,
      'order'
    );

    return verifiedOrder;
  }

  // ----------------------------------------------------
  // Admin Operations (Always refetch from server to maintain real state)
  // ----------------------------------------------------
  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await this.apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // Refetch orders & stats from server
      await this.loadOrders();
      await this.loadAdminStats();
    } catch (err: any) {
      this.showToast(
        this.language === 'bn' ? 'স্ট্যাটাস আপডেট ব্যর্থ' : 'Status Update Failed',
        err?.message || 'Could not update order status on server',
        'info'
      );
      throw err;
    }
  }

  public async saveProduct(product: Product): Promise<void> {
    try {
      const isExisting = this.products.some(p => p.id === product.id);
      if (isExisting) {
        await this.apiFetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
      } else {
        await this.apiFetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
      }
      // Refetch products catalog from server
      await this.loadProducts();
      await this.loadAdminStats();
    } catch (err: any) {
      this.showToast(
        this.language === 'bn' ? 'পণ্য সংরক্ষণ ব্যর্থ' : 'Product Save Failed',
        err?.message || 'Could not save product to server',
        'info'
      );
      throw err;
    }
  }

  public async deleteProduct(id: string): Promise<void> {
    try {
      await this.apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      // Refetch products catalog from server
      await this.loadProducts();
      await this.loadAdminStats();
    } catch (err: any) {
      this.showToast(
        this.language === 'bn' ? 'পণ্য মুছে ফেলা ব্যর্থ' : 'Product Delete Failed',
        err?.message || 'Could not delete product from server',
        'info'
      );
      throw err;
    }
  }

  public async saveTelegramConfig(config: TelegramConfig): Promise<void> {
    try {
      await this.apiFetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      await this.loadTelegramConfig();
    } catch (err: any) {
      this.showToast(
        this.language === 'bn' ? 'টেলিগ্রাম কনফিগ ব্যর্থ' : 'Telegram Config Failed',
        err?.message || 'Could not save Telegram credentials to server',
        'info'
      );
      throw err;
    }
  }

  public async testTelegram(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.apiFetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.telegramConfig),
      });
      return await res.json();
    } catch (err: any) {
      const msg = err?.message || 'Failed to reach server';
      this.showToast('Telegram Test Error', msg, 'info');
      return { success: false, message: msg };
    }
  }

  // Customer Account Session
  public loginUser(identifier: string, role: 'customer' | 'admin' = 'customer'): User {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : `Customer ${identifier.slice(-4)}`,
      email: identifier.includes('@') ? identifier : `${identifier}@customer.7x-shop.com`,
      phone: identifier.includes('@') ? '01712345678' : identifier,
      role: role,
      district: 'Dhaka',
      createdAt: new Date().toISOString(),
    };
    this.currentUser = user;
    this.notify();
    return user;
  }

  public logoutUser(): void {
    this.currentUser = null;
    this.notify();
  }

  public switchDemoAccount(role: 'admin' | 'customer'): void {
    if (role === 'admin') {
      this.currentUser = {
        id: 'usr-admin-1',
        name: 'Admin Saif',
        email: 'saif01811534513solima@gmail.com',
        phone: '01811534513',
        role: 'admin',
        district: 'Dhaka',
        createdAt: '2026-01-15T08:00:00Z',
      };
    } else {
      this.currentUser = {
        id: 'usr-cust-1',
        name: 'Tanvir Hossain',
        email: 'tanvir.dev@gmail.com',
        phone: '01712345678',
        role: 'customer',
        district: 'Dhaka',
        createdAt: '2026-02-10T11:20:00Z',
      };
    }
    this.notify();
  }

  // Admin Security & Backend Authentication
  public async unlockAdminWithBackend(password: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.adminUnlocked = true;
        this.adminToken = data.token;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('7x_shop_admin_unlocked', 'true');
          sessionStorage.setItem('7x_shop_admin_token', data.token);
        }
        this.switchDemoAccount('admin');
        await this.loadAdminData();
        this.notify();
        return true;
      }
      if (data.message) {
        this.showToast('Auth Notice', data.message, 'info');
      }
    } catch {
      this.showToast('Server Notice', 'Could not connect to authentication server', 'info');
    }
    return false;
  }

  public lockAdmin(): void {
    this.adminUnlocked = false;
    this.adminToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('7x_shop_admin_unlocked');
      sessionStorage.removeItem('7x_shop_admin_token');
    }
    this.notify();
  }

  public async changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.apiFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        this.adminPasswordChangedAt = new Date().toISOString();
        setStoredItem(STORAGE_KEYS.ADMIN_PASSWORD_CHANGED, this.adminPasswordChangedAt);
        this.showToast(
          this.language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে' : 'Password Changed',
          data.message || (this.language === 'bn' ? 'নতুন পাসওয়ার্ড দিয়ে পরবর্তী লগইন সুরক্ষিত থাকবে।' : 'New admin password has been saved.'),
          'success'
        );
        this.notify();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update password' };
    } catch (err: any) {
      const msg = err?.message || 'Failed to update admin password';
      this.showToast(
        this.language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ' : 'Password Change Failed',
        msg,
        'info'
      );
      return { success: false, message: msg };
    }
  }

  // Product Reviews
  public async addReview(productId: string, rating: number, comment: string, customerName: string): Promise<ProductReview | null> {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment, customerName }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        this.reviews.unshift(json.data);
        await this.loadProducts();
        this.notify();
        return json.data;
      }
    } catch (err) {
      console.warn('Failed to submit review to server:', err);
    }
    return null;
  }

  // Site Settings & Content Customization
  public async updateSiteSettings(updates: Partial<SiteSettings>): Promise<boolean> {
    try {
      const res = await this.apiFetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success && json.data) {
        this.siteSettings = json.data;
        this.notify();
      }
    } catch (err: any) {
      this.showToast(
        this.language === 'bn' ? 'সেটিংস আপডেট ব্যর্থ' : 'Settings Save Failed',
        err?.message || 'Could not sync settings with server',
        'info'
      );
      throw err;
    }

    this.showToast(
      this.language === 'bn' ? 'সেটিংস আপডেট সম্পন্ন' : 'Settings Saved',
      this.language === 'bn' ? 'ইউজার প্যানেলে পরিবর্তন তাৎক্ষণিকভাবে দৃশ্যমান হয়েছে।' : 'Changes are now live across the user storefront.',
      'success'
    );
    return true;
  }

  // Hero Slide Operations
  public async addHeroSlide(slideData: Omit<HeroSlide, 'id'>): Promise<HeroSlide> {
    const newSlide: HeroSlide = {
      ...slideData,
      id: `slide-${Date.now()}`,
    };
    const updatedSlides = [...this.siteSettings.heroSlides, newSlide];
    await this.updateSiteSettings({ heroSlides: updatedSlides });
    this.showToast(
      this.language === 'bn' ? 'নতুন ব্যানার স্লাইড যোগ হয়েছে' : 'Slide Added',
      this.language === 'bn' ? 'হোমপেজ স্লাইডারে নতুন ব্যানারটি প্রদর্শিত হচ্ছে।' : 'New banner slide added to the homepage carousel.',
      'success'
    );
    return newSlide;
  }

  public async updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<boolean> {
    const updatedSlides = this.siteSettings.heroSlides.map(slide => {
      if (slide.id === id) {
        return { ...slide, ...updates };
      }
      return slide;
    });
    await this.updateSiteSettings({ heroSlides: updatedSlides });
    return true;
  }

  public async deleteHeroSlide(id: string): Promise<boolean> {
    const updatedSlides = this.siteSettings.heroSlides.filter(slide => slide.id !== id);
    if (updatedSlides.length === 0) {
      this.showToast(
        this.language === 'bn' ? 'সতর্কতা' : 'Warning',
        this.language === 'bn' ? 'কমপক্ষে একটি স্লাইড সক্রিয় থাকা প্রয়োজন।' : 'At least one slide should remain in the carousel.',
        'info'
      );
      return false;
    }
    await this.updateSiteSettings({ heroSlides: updatedSlides });
    this.showToast(
      this.language === 'bn' ? 'স্লাইড মুছে ফেলা হয়েছে' : 'Slide Deleted',
      this.language === 'bn' ? 'ব্যানার স্লাইডার থেকে সফলভাবে সরানো হয়েছে।' : 'Slide removed from the homepage carousel.',
      'info'
    );
    return true;
  }

  public async reorderHeroSlides(fromIndex: number, toIndex: number): Promise<boolean> {
    const slides = [...this.siteSettings.heroSlides];
    if (fromIndex < 0 || fromIndex >= slides.length || toIndex < 0 || toIndex >= slides.length) {
      return false;
    }
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);
    await this.updateSiteSettings({ heroSlides: slides });
    return true;
  }

  public async resetSiteSettings(): Promise<boolean> {
    try {
      const res = await this.apiFetch('/api/site-settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success && json.data) {
        this.siteSettings = json.data;
        this.notify();
      }
    } catch (err: any) {
      this.showToast(
        this.language === 'bn' ? 'রিসেট ব্যর্থ' : 'Reset Failed',
        err?.message || 'Could not reset site settings on server',
        'info'
      );
      throw err;
    }

    this.showToast(
      this.language === 'bn' ? 'ডিফল্ট সেটিংস সফল' : 'Reset Complete',
      this.language === 'bn' ? 'সকল স্লাইড এবং কন্টাক্ট ইনফরমেশন প্রারম্ভিক অবস্থায় ফিরিয়ে আনা হয়েছে।' : 'All site settings and slides reset to factory defaults.',
      'info'
    );
    return true;
  }
}

// React Hook
export function useShopStore() {
  const store = ShopStateService.getInstance();
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, [store]);

  return store;
}
