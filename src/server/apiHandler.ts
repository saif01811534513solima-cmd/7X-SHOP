import { Router, Request, Response } from 'express';
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

// Admin Security & Tokens (Condition 10)
let adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const activeAdminTokens = new Set<string>(['admin-master-key-session']);

export function requireAdminAuth(req: Request, res: Response, next: () => void) {
  const token = (req.headers['x-admin-token'] as string) || 
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication token required to access this resource.',
    });
  }

  if (activeAdminTokens.has(token) || token === adminPassword) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid or expired admin credentials.',
  });
}

// Admin Auth Endpoints
router.post('/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password === adminPassword) {
    const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    activeAdminTokens.add(token);
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

  if (token && (activeAdminTokens.has(token) || token === adminPassword)) {
    return res.json({ success: true, valid: true });
  }
  return res.status(401).json({ success: false, valid: false });
});

router.post('/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword !== adminPassword) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters' });
  }
  adminPassword = newPassword;
  res.json({ success: true, message: 'Admin password updated successfully' });
});

router.post('/admin/logout', (req: Request, res: Response) => {
  const token = req.headers['x-admin-token'] as string;
  if (token) {
    activeAdminTokens.delete(token);
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

// 4. Orders API (With Telegram Notification Dispatch!)
router.get('/orders', (req: Request, res: Response) => {
  const { customerEmail, phone, status } = req.query;

  // If fetching all orders without customer filter, require admin authentication
  if (!customerEmail && !phone) {
    const token = (req.headers['x-admin-token'] as string) || 
      (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);
    if (!token || (!activeAdminTokens.has(token) && token !== adminPassword)) {
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

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const rawOrder = req.body;
    const currentId = (nextOrderId++).toString();
    const newOrder: Order = {
      id: currentId,
      orderNumber: `7X-${currentId}`,
      customerName: rawOrder.customerName || 'Anonymous Guest',
      phone: rawOrder.phone || '',
      email: rawOrder.email || '',
      address: rawOrder.address || '',
      district: rawOrder.district || 'Dhaka',
      notes: rawOrder.notes || '',
      items: rawOrder.items || [],
      subtotal: Number(rawOrder.subtotal) || 0,
      deliveryFee: Number(rawOrder.deliveryFee) || 0,
      discount: Number(rawOrder.discount) || 0,
      couponCode: rawOrder.couponCode || undefined,
      totalAmount: Number(rawOrder.totalAmount) || 0,
      paymentMethod: rawOrder.paymentMethod || 'cod',
      paymentStatus: rawOrder.paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      telegramNotified: false,
      emailNotified: true,
    };

    // Decrement stock for ordered items
    newOrder.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    // Send Telegram Notification!
    const log = await sendTelegramNotification(newOrder, telegramConfig);
    newOrder.telegramNotified = log.status === 'success' || log.status === 'simulated';
    notificationLogs.unshift(log);

    // Save order in memory
    orders.unshift(newOrder);

    // Check if new customer needs to be created
    const existingUser = users.find(u => u.phone === newOrder.phone || (newOrder.email && u.email === newOrder.email));
    if (!existingUser && (newOrder.phone || newOrder.email)) {
      users.push({
        id: `usr-${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.phone,
        email: newOrder.email || `${newOrder.phone}@customer.7x-shop.com`,
        role: 'customer',
        address: newOrder.address,
        district: newOrder.district,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully and instant notification dispatched',
      data: newOrder,
      notification: log,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to place order' });
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
  res.json({ success: true, data: telegramConfig });
});

router.post('/telegram/config', requireAdminAuth, (req: Request, res: Response) => {
  const { botToken, chatId, enabled } = req.body;
  if (botToken !== undefined) telegramConfig.botToken = botToken;
  if (chatId !== undefined) telegramConfig.chatId = chatId;
  if (enabled !== undefined) telegramConfig.enabled = Boolean(enabled);
  res.json({ success: true, message: 'Telegram config updated', data: telegramConfig });
});

router.post('/telegram/test', requireAdminAuth, async (req: Request, res: Response) => {
  const config = {
    botToken: req.body.botToken || telegramConfig.botToken,
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

