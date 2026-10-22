import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_COUPONS, 
  DEFAULT_SITE_SETTINGS
} from '../data/mockData';
import { 
  initialOrders, 
  initialUsers, 
  initialReviews, 
  defaultTelegramConfig, 
  initialNotificationLogs 
} from './db';
import { sendTelegramNotification, sendTestTelegramMessage } from './telegramService';
import { Product, Order, User, TelegramConfig, NotificationLog, ProductReview, SiteSettings } from '../types';

export const router = Router();

// In-memory data store for server
let products: Product[] = [...INITIAL_PRODUCTS];
let orders: Order[] = [...initialOrders];
let users: User[] = [...initialUsers];
let reviews: ProductReview[] = [...initialReviews];
let telegramConfig: TelegramConfig = { ...defaultTelegramConfig };
let notificationLogs: NotificationLog[] = [...initialNotificationLogs];
let siteSettings: SiteSettings = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
let nextOrderId = 1004;

// ----------------------------------------------------
// Security: Dynamic Rate Limiters
// ----------------------------------------------------
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts allowed
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed admin login attempts from this IP. Please wait 15 minutes before trying again.',
  },
});

export const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 orders per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Order creation rate limit reached. Please wait a few minutes before placing another order.',
  },
});

// ----------------------------------------------------
// Security: Admin Password & Active Sessions
// ----------------------------------------------------
interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

// Active session tokens with 24-hour expiration (NO HARDCODED MASTER KEY)
const activeAdminSessions = new Map<string, AdminSession>();

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeAdminSessions.entries()) {
    if (session.expiresAt <= now) {
      activeAdminSessions.delete(token);
    }
  }
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  cleanExpiredSessions();
  return activeAdminSessions.has(token);
}

// Verify configured admin password
function getConfiguredAdminPassword(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  // Disallow missing or insecure default passwords
  if (!pwd || pwd.trim() === '' || pwd === 'admin123') {
    return null;
  }
  return pwd.trim();
}

let runtimeAdminPasswordOverride: string | null = null;

function getEffectiveAdminPassword(): string | null {
  return runtimeAdminPasswordOverride || getConfiguredAdminPassword();
}

export function requireAdminAuth(req: Request, res: Response, next: () => void) {
  const token = (req.headers['x-admin-token'] as string) || 
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication token required to access this resource.',
    });
  }

  if (isValidAdminToken(token)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid or expired admin credentials.',
  });
}

// Admin Auth Endpoints
router.post('/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  const configuredPassword = getEffectiveAdminPassword();
  if (!configuredPassword) {
    return res.status(503).json({
      success: false,
      message: 'Admin login is currently disabled: ADMIN_PASSWORD environment variable is not configured or uses an insecure default (admin123). Please set a secure ADMIN_PASSWORD in your server environment.',
    });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  // Constant-time comparison to prevent timing attacks
  const isMatch = password.length === configuredPassword.length &&
    crypto.timingSafeEqual(
      Buffer.from(password.padEnd(64, ' ')),
      Buffer.from(configuredPassword.padEnd(64, ' '))
    );

  if (isMatch) {
    const token = `adm_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();
    activeAdminSessions.set(token, {
      token,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24-hour expiration
    });

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: users.find(u => u.role === 'admin') || initialUsers[0],
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials',
  });
});

router.post('/admin/verify', (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || 
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  if (isValidAdminToken(token)) {
    return res.json({ success: true, valid: true });
  }
  return res.status(401).json({ success: false, valid: false });
});

router.post('/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const activePassword = getEffectiveAdminPassword();

  if (!activePassword || currentPassword !== activePassword) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  if (newPassword === 'admin123' || newPassword.toLowerCase() === 'password') {
    return res.status(400).json({ success: false, message: 'Insecure password: default passwords like admin123 are not permitted' });
  }

  runtimeAdminPasswordOverride = newPassword;
  // Invalidate previous sessions except the current one
  const currentToken = (req.headers['x-admin-token'] as string) || 
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  for (const token of activeAdminSessions.keys()) {
    if (token !== currentToken) {
      activeAdminSessions.delete(token);
    }
  }

  res.json({ success: true, message: 'Admin password updated successfully. All other active sessions have been invalidated.' });
});

router.post('/admin/logout', (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || 
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 1. Products API
router.get('/products', (req: Request, res: Response) => {
  const { category, search, sort, hot, featured } = req.query;
  let result = [...products];

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(p => 
      p.nameEn.toLowerCase().includes(q) || 
      p.nameBn.includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.descriptionEn.toLowerCase().includes(q)
    );
  }

  if (hot === 'true') {
    result = result.filter(p => p.isHot);
  }

  if (featured === 'true') {
    result = result.filter(p => p.isFeatured);
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  res.json({ success: true, count: result.length, data: result });
});

router.get('/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

router.post('/products', requireAdminAuth, (req: Request, res: Response) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    slug: req.body.slug || req.body.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating: req.body.rating || 5.0,
    reviewCount: req.body.reviewCount || 0,
  };
  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

router.put('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  products[index] = { ...products[index], ...req.body, id: req.params.id };
  res.json({ success: true, data: products[index] });
});

router.delete('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const initialLen = products.length;
  products = products.filter(p => p.id !== req.params.id);
  if (products.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted' });
});

// 2. Categories API
router.get('/categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: INITIAL_CATEGORIES });
});

// 3. Coupons API
router.get('/coupons/validate/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase().trim();
  const coupon = INITIAL_COUPONS.find(c => c.code === code);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  }
  res.json({ success: true, data: coupon });
});

// 4. Orders API (With Telegram Notification Dispatch & Server-side Price Verification!)
router.get('/orders', (req: Request, res: Response) => {
  const { customerEmail, phone, status } = req.query;

  // If fetching all orders without customer filter, require admin authentication
  if (!customerEmail && !phone) {
    const token = (req.headers['x-admin-token'] as string) || 
      (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);
    if (!isValidAdminToken(token)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin authentication required to list all customer orders.',
      });
    }
  }

  let filtered = [...orders];

  if (customerEmail && typeof customerEmail === 'string') {
    filtered = filtered.filter(o => o.email.toLowerCase() === customerEmail.toLowerCase());
  }

  if (phone && typeof phone === 'string') {
    filtered = filtered.filter(o => o.phone.includes(phone));
  }

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter(o => o.orderStatus === status);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, count: filtered.length, data: filtered });
});

router.post('/orders', orderRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawOrder = req.body;
    if (!rawOrder || typeof rawOrder !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid order request payload' });
    }

    // 1. Strict Input Validation & Sanitization
    const customerName = String(rawOrder.customerName || '').trim();
    const phone = String(rawOrder.phone || '').trim();
    const email = String(rawOrder.email || '').trim();
    const address = String(rawOrder.address || '').trim();
    const district = String(rawOrder.district || 'Dhaka').trim();
    const notes = String(rawOrder.notes || '').trim().slice(0, 500);
    const paymentMethod = String(rawOrder.paymentMethod || 'cod').toLowerCase();
    const items = rawOrder.items;

    if (!customerName || customerName.length < 2 || customerName.length > 100) {
      return res.status(400).json({ success: false, message: 'Please provide a valid customer full name (2-100 characters)' });
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15 || !/^\+?\d+$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (10-15 digits)' });
    }

    if (!address || address.length < 5 || address.length > 300) {
      return res.status(400).json({ success: false, message: 'Please provide a full delivery address (minimum 5 characters)' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your order must contain at least one item' });
    }

    // Priority 4: Block raw credit card submissions until certified gateway is live
    if (paymentMethod === 'card') {
      return res.status(400).json({
        success: false,
        message: 'Credit / Debit card processing is currently unavailable. Please select Cash on Delivery or Mobile Banking (bKash / Nagad / Rocket).',
      });
    }

    const allowedPaymentMethods = ['cod', 'bkash', 'nagad', 'rocket'];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: `Unsupported payment method: ${paymentMethod}` });
    }

    // Validate Mobile Banking details
    let validatedTrxId: string | undefined = undefined;
    let validatedSenderNumber: string | undefined = undefined;
    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
      const rawTrx = String(rawOrder.trxId || '').trim();
      const rawSender = String(rawOrder.senderNumber || '').trim().replace(/[\s-]/g, '');
      if (!rawTrx || rawTrx.length < 3 || rawTrx.length > 40) {
        return res.status(400).json({ success: false, message: 'Valid Transaction ID (TrxID) is required for mobile banking payments' });
      }
      if (!rawSender || rawSender.length < 10) {
        return res.status(400).json({ success: false, message: 'Sender mobile number is required for mobile banking verification' });
      }
      validatedTrxId = rawTrx.toUpperCase();
      validatedSenderNumber = rawSender;
    }

    // 2. Server-side Product Lookup, Stock Verification & Price Recalculation (Priority 3)
    let verifiedSubtotal = 0;
    const verifiedItems: Order['items'] = [];

    for (const item of items) {
      const productId = String(item.productId || '');
      const quantity = Math.floor(Number(item.quantity));

      if (!productId || isNaN(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({
          success: false,
          message: `Invalid product quantity (${quantity}) for product ID: ${productId}`,
        });
      }

      const prod = products.find(p => p.id === productId);
      if (!prod) {
        return res.status(400).json({
          success: false,
          message: `Product '${productId}' not found in active inventory`,
        });
      }

      if (prod.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${prod.nameEn}'. In stock: ${prod.stock}, Requested: ${quantity}`,
        });
      }

      // CRITICAL: Always use official server catalog price (ignore any price sent by client)
      const officialPrice = (typeof prod.discountPrice === 'number' && prod.discountPrice > 0)
        ? prod.discountPrice
        : prod.price;

      verifiedSubtotal += officialPrice * quantity;

      verifiedItems.push({
        productId: prod.id,
        productName: prod.nameEn,
        productImage: prod.images?.[0] || '',
        price: officialPrice,
        quantity,
        selectedColor: item.selectedColor ? String(item.selectedColor) : undefined,
        selectedSize: item.selectedSize ? String(item.selectedSize) : undefined,
      });
    }

    // 3. Server-side Coupon & Discount Calculation
    let verifiedDiscount = 0;
    let validatedCouponCode: string | undefined = undefined;

    if (rawOrder.couponCode && typeof rawOrder.couponCode === 'string') {
      const cleanCoupon = rawOrder.couponCode.toUpperCase().trim();
      const coupon = INITIAL_COUPONS.find(c => c.code === cleanCoupon);
      if (coupon) {
        const meetsMinSpend = !coupon.minSpend || verifiedSubtotal >= coupon.minSpend;
        if (meetsMinSpend) {
          validatedCouponCode = coupon.code;
          if (coupon.discountType === 'percentage') {
            verifiedDiscount = Math.round((verifiedSubtotal * coupon.discountValue) / 100);
          } else if (coupon.discountType === 'fixed') {
            verifiedDiscount = Math.min(verifiedSubtotal, coupon.discountValue);
          }
        }
      }
    }

    // 4. Server-side Delivery Fee Calculation
    let verifiedDeliveryFee = 0;
    const isFreeShippingCoupon = validatedCouponCode && 
      INITIAL_COUPONS.find(c => c.code === validatedCouponCode)?.discountType === 'free_shipping';
    const freeDeliveryThreshold = siteSettings.freeDeliveryThreshold ?? 2000;

    if (isFreeShippingCoupon || verifiedSubtotal >= freeDeliveryThreshold) {
      verifiedDeliveryFee = 0;
    } else if (district.toLowerCase() !== 'dhaka') {
      verifiedDeliveryFee = siteSettings.outsideDhakaDeliveryFee ?? 120;
    } else {
      verifiedDeliveryFee = siteSettings.insideDhakaDeliveryFee ?? 60;
    }

    // 5. Server-side Final Total Amount
    const verifiedTotalAmount = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedDeliveryFee);

    // Decrement stock for ordered items
    verifiedItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    const currentId = (nextOrderId++).toString();
    const newOrder: Order = {
      id: currentId,
      orderNumber: `7X-${currentId}`,
      customerName,
      phone: cleanPhone,
      email: email || `${cleanPhone}@customer.7x-shop.com`,
      address,
      district,
      notes,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      deliveryFee: verifiedDeliveryFee,
      discount: verifiedDiscount,
      couponCode: validatedCouponCode,
      totalAmount: verifiedTotalAmount,
      paymentMethod: paymentMethod as any,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (validatedTrxId ? 'pending' : 'pending'),
      orderStatus: 'pending',
      trxId: validatedTrxId,
      senderNumber: validatedSenderNumber,
      mfsProvider: ['bkash', 'nagad', 'rocket'].includes(paymentMethod) ? (paymentMethod as any) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      telegramNotified: false,
      emailNotified: true,
    };

    // Dispatch Telegram notification directly from server
    const log = await sendTelegramNotification(newOrder, telegramConfig);
    newOrder.telegramNotified = log.status === 'success' || log.status === 'simulated';
    notificationLogs.unshift(log);

    // Save order in server storage
    orders.unshift(newOrder);

    // Link customer
    const existingUser = users.find(u => u.phone === newOrder.phone || (newOrder.email && u.email === newOrder.email));
    if (!existingUser) {
      users.push({
        id: `usr-${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.phone,
        email: newOrder.email,
        role: 'customer',
        address: newOrder.address,
        district: newOrder.district,
        createdAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully with verified prices',
      data: newOrder,
      notification: {
        status: log.status,
        details: log.details,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to process order' });
  }
});

router.patch('/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, data: order });
});

// 5. Admin Stats API (Protected)
router.get('/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => o.orderStatus !== 'cancelled' ? sum + o.totalAmount : sum, 0);
  const totalProducts = products.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
    },
  });
});

// 6. Customers API (Protected)
router.get('/customers', requireAdminAuth, (req: Request, res: Response) => {
  const { query } = req.query;
  let result = users.filter(u => u.role === 'customer');
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    result = result.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q));
  }
  res.json({ success: true, count: result.length, data: result });
});

// 7. Telegram Configuration & Notification Logs (Protected)
router.get('/telegram/config', requireAdminAuth, (_req: Request, res: Response) => {
  // Mask the bot token to prevent exposing sensitive credentials to the browser
  const maskedToken = telegramConfig.botToken
    ? `${telegramConfig.botToken.slice(0, 6)}...${telegramConfig.botToken.slice(-4)}`
    : '';

  res.json({
    success: true,
    data: {
      ...telegramConfig,
      botToken: maskedToken,
    },
  });
});

router.post('/telegram/config', requireAdminAuth, (req: Request, res: Response) => {
  const { botToken, chatId, enabled } = req.body;
  // If the token is masked, keep the existing real token
  if (botToken !== undefined && typeof botToken === 'string' && !botToken.includes('...')) {
    telegramConfig.botToken = botToken;
  }
  if (chatId !== undefined) telegramConfig.chatId = chatId;
  if (enabled !== undefined) telegramConfig.enabled = Boolean(enabled);
  res.json({ success: true, message: 'Telegram config updated successfully' });
});

router.post('/telegram/test', requireAdminAuth, async (req: Request, res: Response) => {
  const config = {
    botToken: req.body.botToken && !req.body.botToken.includes('...') ? req.body.botToken : telegramConfig.botToken,
    chatId: req.body.chatId || telegramConfig.chatId,
    enabled: true,
  };
  const result = await sendTestTelegramMessage(config);
  res.json(result);
});

router.get('/telegram/logs', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: notificationLogs });
});

// 8. Reviews API
router.get('/reviews/:productId', (req: Request, res: Response) => {
  const prodReviews = reviews.filter(r => r.productId === req.params.productId);
  res.json({ success: true, data: prodReviews });
});

router.post('/reviews', (req: Request, res: Response) => {
  const newRev: ProductReview = {
    id: `rev-${Date.now()}`,
    productId: req.body.productId,
    customerName: req.body.customerName || 'Verified Buyer',
    rating: Number(req.body.rating) || 5,
    comment: req.body.comment || '',
    date: new Date().toISOString().split('T')[0],
    verifiedPurchase: true,
  };
  reviews.unshift(newRev);

  // Update product average rating
  const prod = products.find(p => p.id === newRev.productId);
  if (prod) {
    const allProdReviews = reviews.filter(r => r.productId === prod.id);
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    prod.rating = Number(avg.toFixed(1));
    prod.reviewCount = allProdReviews.length;
  }

  res.status(201).json({ success: true, data: newRev });
});

// 9. Site Settings & Hero Slider Content Management API
router.get('/site-settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: siteSettings });
});

router.put('/site-settings', requireAdminAuth, (req: Request, res: Response) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  siteSettings = {
    ...siteSettings,
    ...updates,
  };
  res.json({ success: true, message: 'Site settings updated successfully', data: siteSettings });
});

router.post('/site-settings/reset', requireAdminAuth, (_req: Request, res: Response) => {
  siteSettings = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
  res.json({ success: true, message: 'Site settings reset to defaults', data: siteSettings });
});

