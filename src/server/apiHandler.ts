import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { 
  seedDatabaseIfEmpty,
  getProducts,
  getProductByIdOrSlug,
  saveProduct,
  deleteProduct,
  getCategories,
  getCoupon,
  createOrderInTransaction,
  getOrders,
  getOrderByNumberAndPhone,
  updateOrderStatus,
  updateOrderNotificationStatus,
  getCustomers,
  getAdminStats,
  getSiteSettings,
  updateSiteSettings,
  resetSiteSettings,
  getTelegramConfig,
  updateTelegramConfig,
  getNotificationLogs,
  addNotificationLog,
  getReviewsByProduct,
  addReview,
} from './database';
import { 
  AdminLoginSchema, 
  AdminChangePasswordSchema, 
  ProductSchema, 
  ProductUpdateSchema,
  OrderCreateSchema, 
  OrderStatusSchema,
  TelegramConfigSchema, 
  ProductReviewSchema, 
  SiteSettingsSchema 
} from './validation';
import { sendTelegramNotification, sendTestTelegramMessage } from './telegramService';
import { Product, OrderStatus, SiteSettings } from '../types';

export const router = Router();

// Automatically seed collections if empty on initialization
seedDatabaseIfEmpty().catch(err => {
  console.error('[API] Error during database startup seed:', err);
});

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

function getConfiguredAdminPassword(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
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

  if (!token || !isValidAdminToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication token required or expired.',
    });
  }

  return next();
}

// ----------------------------------------------------
// Admin Auth Endpoints
// ----------------------------------------------------
router.post('/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  const parseResult = AdminLoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: parseResult.error.format() 
    });
  }

  const configuredPassword = getEffectiveAdminPassword();
  if (!configuredPassword) {
    return res.status(503).json({
      success: false,
      message: 'Admin login is currently disabled: ADMIN_PASSWORD environment variable is not configured or uses an insecure default (admin123). Please set a secure ADMIN_PASSWORD in your server environment.',
    });
  }

  const { password } = parseResult.data;

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
      user: {
        id: 'usr-admin-1',
        name: 'Shop Administrator',
        email: 'admin@7x-shop.com',
        phone: '01811534513',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
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
  const parseResult = AdminChangePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: parseResult.error.issues[0]?.message || 'Validation failed', 
      errors: parseResult.error.format() 
    });
  }

  const { currentPassword, newPassword } = parseResult.data;
  const activePassword = getEffectiveAdminPassword();

  if (!activePassword || currentPassword !== activePassword) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
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

  res.json({ 
    success: true, 
    message: 'Admin password updated successfully. All other active sessions have been invalidated.' 
  });
});

router.post('/admin/logout', (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || 
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// 1. Products API
// ----------------------------------------------------
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, sort, hot, featured } = req.query;
    const result = await getProducts({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      sort: typeof sort === 'string' ? sort : undefined,
      hot: hot === 'true',
      featured: featured === 'true',
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await getProductByIdOrSlug(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch product' });
  }
});

router.post('/products', requireAdminAuth, async (req: Request, res: Response) => {
  const parseResult = ProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Product validation failed', 
      errors: parseResult.error.format() 
    });
  }

  try {
    const validated = parseResult.data;
    const newProduct: Product = {
      id: validated.id || `prod-${Date.now()}`,
      slug: validated.slug || validated.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      nameEn: validated.nameEn,
      nameBn: validated.nameBn || validated.nameEn,
      category: validated.category,
      price: validated.price,
      discountPrice: validated.discountPrice || undefined,
      stock: validated.stock,
      rating: validated.rating || 5.0,
      reviewCount: validated.reviewCount || 0,
      sku: validated.sku || `7X-${Date.now().toString().slice(-4)}`,
      brand: validated.brand || '7X Brand',
      images: validated.images && validated.images.length > 0 
        ? validated.images 
        : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
      descriptionEn: validated.descriptionEn || 'Authentic merchandise from 7X_SHOP.',
      descriptionBn: validated.descriptionBn || 'উচ্চমানের আসল পণ্য।',
      specs: validated.specs || { Warranty: '1 Year' },
      colors: validated.colors || ['Black'],
      sizes: validated.sizes || [],
      isHot: validated.isHot ?? false,
      isFeatured: validated.isFeatured ?? false,
      isNew: validated.isNew ?? true,
    };

    const saved = await saveProduct(newProduct);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to save product' });
  }
});

router.put('/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const parseResult = ProductUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Product update validation failed', 
      errors: parseResult.error.format() 
    });
  }

  try {
    const existing = await getProductByIdOrSlug(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedData: Product = {
      ...existing,
      ...parseResult.data,
      id: existing.id,
      discountPrice: parseResult.data.discountPrice !== undefined ? (parseResult.data.discountPrice || undefined) : existing.discountPrice,
    };

    const saved = await saveProduct(updatedData);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to update product' });
  }
});

router.delete('/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to delete product' });
  }
});

// ----------------------------------------------------
// 2. Categories API
// ----------------------------------------------------
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch categories' });
  }
});

// ----------------------------------------------------
// 3. Coupons API (Server-side Firestore single source of truth)
// ----------------------------------------------------
router.get('/coupons/validate/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const coupon = await getCoupon(code);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid promo coupon code' });
    }

    // Check Expiry Date
    if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    // Check Usage Limit
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon usage limit has been reached' });
    }

    res.json({ success: true, data: coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to validate coupon' });
  }
});

// ----------------------------------------------------
// 4. Orders API
// ----------------------------------------------------
// 4a. Admin Orders List (Requires valid admin token. No customer parameter bypass)
router.get('/orders', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const orders = await getOrders({
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch orders' });
  }
});

// 4b. Customer Order Tracking (Requires BOTH orderNumber and phone exact match)
router.get('/orders/track', async (req: Request, res: Response) => {
  const { orderNumber, phone } = req.query;

  if (!orderNumber || !phone || typeof orderNumber !== 'string' || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Both orderNumber and phone are required for order tracking.',
    });
  }

  const queryOrderNum = orderNumber.trim();
  const cleanQueryPhone = phone.trim();

  if (!queryOrderNum || !cleanQueryPhone) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order number or phone parameter.',
    });
  }

  try {
    const matched = await getOrderByNumberAndPhone(queryOrderNum, cleanQueryPhone);

    if (!matched) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please verify both your order number and phone number.',
      });
    }

    // Return minimal fields only (orderNumber, status, items, total, createdAt)
    return res.json({
      success: true,
      data: {
        orderNumber: matched.orderNumber || matched.id,
        status: matched.orderStatus,
        items: matched.items.map(it => ({
          productName: it.productName,
          productImage: it.productImage,
          price: it.price,
          quantity: it.quantity,
          selectedColor: it.selectedColor,
          selectedSize: it.selectedSize,
        })),
        total: matched.totalAmount,
        createdAt: matched.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Tracking failed' });
  }
});

// 4c. Atomic Order Creation (Stock check + stock decrement + order creation in ONE transaction)
router.post('/orders', orderRateLimiter, async (req: Request, res: Response) => {
  const parseResult = OrderCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: parseResult.error.issues[0]?.message || 'Order validation failed',
      errors: parseResult.error.format() 
    });
  }

  const orderData = parseResult.data;

  // Block credit cards until certified gateway is live
  if (orderData.paymentMethod === 'card') {
    return res.status(400).json({
      success: false,
      message: 'Credit / Debit card processing is currently unavailable. Please select Cash on Delivery or Mobile Banking (bKash / Nagad / Rocket).',
    });
  }

  // Validate MFS fields
  if (['bkash', 'nagad', 'rocket'].includes(orderData.paymentMethod)) {
    if (!orderData.trxId || orderData.trxId.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Valid Transaction ID (TrxID) is required for mobile banking payments',
      });
    }
    if (!orderData.senderNumber || orderData.senderNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Sender mobile number is required for mobile banking verification',
      });
    }
  }

  try {
    const newOrder = await createOrderInTransaction({
      customerName: orderData.customerName,
      phone: orderData.phone,
      email: orderData.email || undefined,
      address: orderData.address,
      district: orderData.district,
      notes: orderData.notes || undefined,
      paymentMethod: orderData.paymentMethod,
      trxId: orderData.trxId ? orderData.trxId.toUpperCase() : undefined,
      senderNumber: orderData.senderNumber,
      couponCode: orderData.couponCode,
      items: orderData.items,
    });

    // Dispatch Telegram notification directly from server
    const tgConfig = await getTelegramConfig();
    const log = await sendTelegramNotification(newOrder, tgConfig);

    if (log.status === 'success' || log.status === 'simulated') {
      await updateOrderNotificationStatus(newOrder.id, true);
    }
    await addNotificationLog(log);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully with verified prices and reserved stock',
      data: newOrder,
      notification: {
        status: log.status,
        details: log.details,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ 
      success: false, 
      message: error?.message || 'Failed to process order' 
    });
  }
});

// 4d. Order Status Update (Admin)
router.patch('/orders/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
  const parseResult = OrderStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: parseResult.error.issues[0]?.message || 'Invalid order status',
      errors: parseResult.error.format() 
    });
  }

  try {
    const updated = await updateOrderStatus(req.params.id, parseResult.data.status as OrderStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to update order status' });
  }
});

// ----------------------------------------------------
// 5. Admin Stats API (Protected)
// ----------------------------------------------------
router.get('/admin/stats', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const stats = await getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch admin stats' });
  }
});

// ----------------------------------------------------
// 6. Customers API (Protected)
// ----------------------------------------------------
router.get('/customers', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const customers = await getCustomers(typeof req.query.query === 'string' ? req.query.query : undefined);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customers' });
  }
});

// ----------------------------------------------------
// 7. Telegram Configuration & Notification Logs (Protected)
// ----------------------------------------------------
router.get('/telegram/config', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const config = await getTelegramConfig();
    const maskedToken = config.botToken
      ? `${config.botToken.slice(0, 6)}...${config.botToken.slice(-4)}`
      : '';

    res.json({
      success: true,
      data: {
        ...config,
        botToken: maskedToken,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch Telegram config' });
  }
});

router.post('/telegram/config', requireAdminAuth, async (req: Request, res: Response) => {
  const parseResult = TelegramConfigSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: parseResult.error.format() 
    });
  }

  try {
    const current = await getTelegramConfig();
    const updates = parseResult.data;

    let botToken = current.botToken;
    if (updates.botToken && !updates.botToken.includes('...')) {
      botToken = updates.botToken;
    }

    const updated = await updateTelegramConfig({
      botToken,
      chatId: updates.chatId !== undefined ? updates.chatId : current.chatId,
      enabled: updates.enabled !== undefined ? updates.enabled : current.enabled,
      lastTestedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Telegram config updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to update Telegram config' });
  }
});

router.post('/telegram/test', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const current = await getTelegramConfig();
    const config = {
      botToken: req.body.botToken && !req.body.botToken.includes('...') ? req.body.botToken : current.botToken,
      chatId: req.body.chatId || current.chatId,
      enabled: true,
    };
    const result = await sendTestTelegramMessage(config);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to test Telegram' });
  }
});

router.get('/telegram/logs', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const logs = await getNotificationLogs();
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch notification logs' });
  }
});

// ----------------------------------------------------
// 8. Reviews API
// ----------------------------------------------------
router.get('/reviews/:productId', async (req: Request, res: Response) => {
  try {
    const reviews = await getReviewsByProduct(req.params.productId);
    res.json({ success: true, data: reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch reviews' });
  }
});

router.post('/reviews', async (req: Request, res: Response) => {
  const parseResult = ProductReviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Review validation failed', 
      errors: parseResult.error.format() 
    });
  }

  try {
    const data = parseResult.data;
    const newRev = await addReview({
      id: `rev-${Date.now()}`,
      productId: data.productId,
      customerName: data.customerName,
      rating: data.rating,
      comment: data.comment,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
    });

    res.status(201).json({ success: true, data: newRev });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to save review' });
  }
});

// ----------------------------------------------------
// 9. Site Settings & Content Management API
// ----------------------------------------------------
router.get('/site-settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getSiteSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch site settings' });
  }
});

router.put('/site-settings', requireAdminAuth, async (req: Request, res: Response) => {
  const parseResult = SiteSettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Site settings validation failed', 
      errors: parseResult.error.format() 
    });
  }

  try {
    const updated = await updateSiteSettings(parseResult.data as unknown as Partial<SiteSettings>);
    res.json({ success: true, message: 'Site settings updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to update site settings' });
  }
});

router.post('/site-settings/reset', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const reset = await resetSiteSettings();
    res.json({ success: true, message: 'Site settings reset to defaults', data: reset });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to reset site settings' });
  }
});
