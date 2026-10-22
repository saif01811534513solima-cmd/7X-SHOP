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
  HeroSlide
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_COUPONS, 
  DEFAULT_SITE_SETTINGS, 
  INITIAL_HERO_SLIDES 
} from '../data/mockData';
import { 
  initialOrders, 
  initialUsers, 
  initialReviews, 
  defaultTelegramConfig, 
  initialNotificationLogs 
} from '../server/db';
import { translations } from '../utils/translations';
import { sendTelegramNotification, sendTestTelegramMessage } from '../server/telegramService';

// Audio chime using Web Audio API for zero external dependency order alerts!
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
  } catch (e) {
    // Audio context might be restricted before user gesture
  }
}

const STORAGE_KEYS = {
  PRODUCTS: '7x_shop_products_v1',
  ORDERS: '7x_shop_orders_v1',
  USERS: '7x_shop_users_v1',
  CART: '7x_shop_cart_v1',
  CURRENT_USER: '7x_shop_current_user_v1',
  LANGUAGE: '7x_shop_lang_v1',
  CURRENCY: '7x_shop_curr_v1',
  TELEGRAM_CONFIG: '7x_shop_tg_config_v1',
  NOTIFICATION_LOGS: '7x_shop_tg_logs_v1',
  REVIEWS: '7x_shop_reviews_v1',
  PAYMENT_SETTINGS: '7x_shop_payment_settings_v1',
  ADMIN_PASSWORD: '7x_shop_admin_password_v1',
  ADMIN_PASSWORD_CHANGED: '7x_shop_admin_password_changed_v1',
  SITE_SETTINGS: '7x_shop_site_settings_v1',
};


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
    enabled: true,
    labelEn: 'Debit / Credit Card (Visa, Mastercard, Amex)',
    labelBn: 'ডেবিট / ক্রেডিট কার্ড (Visa, Mastercard, Amex)',
    gatewayName: '3D Secure 2.0 Gateway',
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

  public products: Product[];
  public orders: Order[];
  public users: User[];
  public cart: CartItem[];
  public currentUser: User | null;
  public language: Language;
  public currency: Currency;
  public telegramConfig: TelegramConfig;
  public notificationLogs: NotificationLog[];
  public reviews: ProductReview[];
  public paymentSettings: PaymentSettings;
  public siteSettings: SiteSettings;
  public appliedCoupon: Coupon | null = null;
  public liveToast: { title: string; message: string; type: 'success' | 'info' | 'order' } | null = null;
  public adminPassword: string;
  public adminPasswordChangedAt: string;
  public adminUnlocked: boolean = false;
  public adminToken: string | null = null;

  private constructor() {
    this.products = getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    // Remove prod-topget-rc-drift if it was previously cached in storage
    if (this.products.some(p => p.id === 'prod-topget-rc-drift')) {
      this.products = this.products.filter(p => p.id !== 'prod-topget-rc-drift');
      setStoredItem(STORAGE_KEYS.PRODUCTS, this.products);
    }
    this.orders = getStoredItem<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    this.users = getStoredItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
    this.cart = getStoredItem<CartItem[]>(STORAGE_KEYS.CART, []);
    this.currentUser = getStoredItem<User | null>(STORAGE_KEYS.CURRENT_USER, initialUsers[1]); // default to customer
    this.language = getStoredItem<Language>(STORAGE_KEYS.LANGUAGE, 'en');
    this.currency = getStoredItem<Currency>(STORAGE_KEYS.CURRENCY, 'BDT');
    this.telegramConfig = getStoredItem<TelegramConfig>(STORAGE_KEYS.TELEGRAM_CONFIG, defaultTelegramConfig);
    this.notificationLogs = getStoredItem<NotificationLog[]>(STORAGE_KEYS.NOTIFICATION_LOGS, initialNotificationLogs);
    this.reviews = getStoredItem<ProductReview[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    this.paymentSettings = getStoredItem<PaymentSettings>(STORAGE_KEYS.PAYMENT_SETTINGS, defaultPaymentSettings);
    
    // Initialize Site Settings with fallback defaults
    const storedSettings = getStoredItem<Partial<SiteSettings>>(STORAGE_KEYS.SITE_SETTINGS, {});
    this.siteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...storedSettings,
      heroSlides: (storedSettings.heroSlides && storedSettings.heroSlides.length > 0)
        ? storedSettings.heroSlides
        : DEFAULT_SITE_SETTINGS.heroSlides,
      trustBadges: {
        ...DEFAULT_SITE_SETTINGS.trustBadges,
        ...(storedSettings.trustBadges || {}),
      },
    };

    this.adminPassword = getStoredItem<string>(STORAGE_KEYS.ADMIN_PASSWORD, 'admin123');
    this.adminPasswordChangedAt = getStoredItem<string>(STORAGE_KEYS.ADMIN_PASSWORD_CHANGED, '2026-01-01T00:00:00.000Z');
    this.adminUnlocked = typeof window !== 'undefined' ? sessionStorage.getItem('7x_shop_admin_unlocked') === 'true' : false;
    this.adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('7x_shop_admin_token') : null;
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

  // Payment Settings Management
  public updatePaymentSettings(settings: PaymentSettings): void {
    this.paymentSettings = { ...settings };
    setStoredItem(STORAGE_KEYS.PAYMENT_SETTINGS, this.paymentSettings);
    this.notify();
  }

  // Cart operations
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

  public applyCoupon(code: string): { success: boolean; message: string } {
    const cleanCode = code.toUpperCase().trim();
    const coupon = INITIAL_COUPONS.find(c => c.code === cleanCode);
    if (!coupon) {
      return { 
        success: false, 
        message: this.language === 'bn' ? 'অবৈধ কুপন কোড' : 'Invalid promo coupon code' 
      };
    }
    this.appliedCoupon = coupon;
    this.notify();
    return { 
      success: true, 
      message: this.language === 'bn' ? coupon.descriptionBn : coupon.descriptionEn 
    };
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


  // Order Placement with instant Telegram Trigger
  public async placeOrder(orderData: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    district: string;
    notes?: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
    trxId?: string;
    senderNumber?: string;
    mfsProvider?: 'bkash' | 'nagad' | 'rocket';
  }): Promise<Order> {
    const subtotal = this.getCartSubtotal();
    const discount = this.getCartDiscount(subtotal);
    const deliveryFee = this.getCartDeliveryFee(subtotal, orderData.district);
    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

    const orderNumberId = (1000 + this.orders.length + 1).toString();

    const order: Order = {
      id: orderNumberId,
      orderNumber: `7X-${orderNumberId}`,
      customerName: orderData.customerName,
      phone: orderData.phone,
      email: orderData.email || `${orderData.phone}@customer.7x-shop.com`,
      address: orderData.address,
      district: orderData.district,
      notes: orderData.notes,
      items: this.cart.map(item => ({
        productId: item.product.id,
        productName: item.product.nameEn,
        productImage: item.product.images[0],
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
      subtotal,
      deliveryFee,
      discount,
      couponCode: this.appliedCoupon?.code,
      totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : (orderData.trxId ? 'completed' : 'pending'),
      orderStatus: 'pending',
      trxId: orderData.trxId,
      senderNumber: orderData.senderNumber,
      mfsProvider: orderData.mfsProvider,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      telegramNotified: false,
      emailNotified: true,
    };

    // Deduct stock
    order.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    setStoredItem(STORAGE_KEYS.PRODUCTS, this.products);

    // Trigger Telegram Notification
    const log = await sendTelegramNotification(order, this.telegramConfig);
    order.telegramNotified = log.status === 'success' || log.status === 'simulated';
    this.notificationLogs.unshift(log);
    setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, this.notificationLogs);

    // Save order
    this.orders.unshift(order);
    setStoredItem(STORAGE_KEYS.ORDERS, this.orders);

    // Audio chime for instant admin feedback
    playOrderNotificationChime();

    // Auto-create or link customer
    const existing = this.users.find(u => u.phone === order.phone || u.email === order.email);
    if (!existing) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: order.customerName,
        phone: order.phone,
        email: order.email,
        role: 'customer',
        address: order.address,
        district: order.district,
        createdAt: new Date().toISOString(),
      };
      this.users.push(newUser);
      setStoredItem(STORAGE_KEYS.USERS, this.users);
    }

    // Also send to backend API asynchronously for consistency
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }).catch(() => {});
    } catch {}

    // Clear cart
    this.clearCart();

    this.showToast(
      '🔔 Order Received!',
      `Order #${order.id} placed. Instant Telegram notification sent to admin!`,
      'order'
    );

    return order;
  }

  // Admin order status update
  public updateOrderStatus(orderId: string, status: Order['orderStatus']): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.orderStatus = status;
      order.updatedAt = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.ORDERS, this.orders);
      this.notify();
      try {
        fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }).catch(() => {});
      } catch {}
    }
  }

  // Product management
  public saveProduct(product: Product): void {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index > -1) {
      this.products[index] = product;
    } else {
      this.products.unshift(product);
    }
    setStoredItem(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    try {
      if (index > -1) {
        fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        }).catch(() => {});
      } else {
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        }).catch(() => {});
      }
    } catch {}
  }

  public deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
    setStoredItem(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    try {
      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
  }

  // Telegram Config update
  public saveTelegramConfig(config: TelegramConfig): void {
    this.telegramConfig = config;
    setStoredItem(STORAGE_KEYS.TELEGRAM_CONFIG, config);
    this.notify();
    try {
      fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).catch(() => {});
    } catch {}
  }

  public async testTelegram(): Promise<{ success: boolean; message: string }> {
    const res = await sendTestTelegramMessage(this.telegramConfig);
    return res;
  }

  // Auth & User Switch
  public loginUser(identifier: string, role: 'customer' | 'admin' = 'customer'): User {
    let user = this.users.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier);
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : `Customer ${identifier.slice(-4)}`,
        email: identifier.includes('@') ? identifier : `${identifier}@customer.7x-shop.com`,
        phone: identifier.includes('@') ? '01712345678' : identifier,
        role: role,
        district: 'Dhaka',
        createdAt: new Date().toISOString(),
      };
      this.users.push(user);
      setStoredItem(STORAGE_KEYS.USERS, this.users);
    }
    this.currentUser = user;
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
    return user;
  }

  public logoutUser(): void {
    this.currentUser = null;
    setStoredItem(STORAGE_KEYS.CURRENT_USER, null);
    this.notify();
  }

  public switchDemoAccount(role: 'admin' | 'customer'): void {
    if (role === 'admin') {
      const admin = this.users.find(u => u.role === 'admin') || initialUsers[0];
      this.currentUser = admin;
    } else {
      const cust = this.users.find(u => u.role === 'customer') || initialUsers[1];
      this.currentUser = cust;
    }
    setStoredItem(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  // Admin Security & Password Management
  public unlockAdmin(password: string): boolean {
    if (password === this.adminPassword) {
      this.adminUnlocked = true;
      this.adminToken = 'admin-master-key-session';
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('7x_shop_admin_unlocked', 'true');
        sessionStorage.setItem('7x_shop_admin_token', 'admin-master-key-session');
      }
      this.switchDemoAccount('admin');
      this.notify();
      return true;
    }
    return false;
  }

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
        this.notify();
        return true;
      }
    } catch {
      // Fallback to local check
    }
    return this.unlockAdmin(password);
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

  public updateAdminPassword(currentPass: string, newPass: string): { success: boolean; message: string } {
    if (currentPass !== this.adminPassword) {
      return {
        success: false,
        message: this.language === 'bn' ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' : 'Current password does not match.',
      };
    }
    if (!newPass || newPass.trim().length < 4) {
      return {
        success: false,
        message: this.language === 'bn' ? 'নতুন পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।' : 'New password must be at least 4 characters long.',
      };
    }

    this.adminPassword = newPass.trim();
    this.adminPasswordChangedAt = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.ADMIN_PASSWORD, this.adminPassword);
    setStoredItem(STORAGE_KEYS.ADMIN_PASSWORD_CHANGED, this.adminPasswordChangedAt);
    this.showToast(
      this.language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে' : 'Password Changed',
      this.language === 'bn' ? 'নতুন পাসওয়ার্ড দিয়ে পরবর্তী লগইন সুরক্ষিত থাকবে।' : 'New admin password has been saved.',
      'success'
    );
    this.notify();
    return {
      success: true,
      message: this.language === 'bn' ? 'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Admin password successfully updated!',
    };
  }

  // Product Reviews
  public addReview(productId: string, rating: number, comment: string, customerName: string): ProductReview {
    const rev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      customerName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
    };
    this.reviews.unshift(rev);
    setStoredItem(STORAGE_KEYS.REVIEWS, this.reviews);

    // Update product rating
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const prodRevs = this.reviews.filter(r => r.productId === productId);
      const avg = prodRevs.reduce((acc, r) => acc + r.rating, 0) / prodRevs.length;
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = prodRevs.length;
      setStoredItem(STORAGE_KEYS.PRODUCTS, this.products);
    }

    this.notify();
    return rev;
  }

  // Site Settings & Content Customization (Banners, Helpline, Hotline, Top Bar, Fees, Footer)
  public async updateSiteSettings(updates: Partial<SiteSettings>): Promise<boolean> {
    this.siteSettings = {
      ...this.siteSettings,
      ...updates,
      trustBadges: {
        ...this.siteSettings.trustBadges,
        ...(updates.trustBadges || {}),
      },
    };
    setStoredItem(STORAGE_KEYS.SITE_SETTINGS, this.siteSettings);
    this.notify();

    // Sync to backend if admin token available
    try {
      const token = this.adminToken || this.adminPassword;
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(this.siteSettings),
      });
    } catch (e) {
      // Offline or preview fallback
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
    this.siteSettings = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
    setStoredItem(STORAGE_KEYS.SITE_SETTINGS, this.siteSettings);
    this.notify();

    try {
      const token = this.adminToken || this.adminPassword;
      await fetch('/api/site-settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
      });
    } catch (e) {}

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
