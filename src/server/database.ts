import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { 
  getFirestore as initFirestore, 
  Firestore, 
  DocumentSnapshot, 
  DocumentReference, 
  Transaction, 
  QueryDocumentSnapshot 
} from 'firebase-admin/firestore';
import { 
  Product, 
  Order, 
  User, 
  TelegramConfig, 
  NotificationLog, 
  ProductReview, 
  SiteSettings, 
  Category, 
  Coupon,
  OrderStatus
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_COUPONS, 
  DEFAULT_SITE_SETTINGS 
} from '../data/mockData';

// ----------------------------------------------------
// Firestore Initialization (Single point of contact)
// ----------------------------------------------------
let firestoreDb: Firestore | null = null;

// In-memory fallback stores when FIREBASE_SERVICE_ACCOUNT_JSON is not configured
const memStore = {
  products: new Map<string, Product>(),
  categories: new Map<string, Category>(),
  coupons: new Map<string, Coupon>(),
  orders: new Map<string, Order>(),
  users: new Map<string, User>(),
  reviews: new Map<string, ProductReview>(),
  notificationLogs: [] as NotificationLog[],
  siteSettings: JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)) as SiteSettings,
  telegramConfig: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    lastTestedAt: new Date().toISOString(),
  } as TelegramConfig,
  nextOrderNumber: 1001,
};

export function getFirestore(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const rawCreds = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawCreds || !rawCreds.trim()) {
    console.info('[Database] FIREBASE_SERVICE_ACCOUNT_JSON not set. Using in-memory fallback store.');
    return null;
  }

  try {
    let serviceAccount: any;
    if (typeof rawCreds === 'string') {
      serviceAccount = JSON.parse(rawCreds);
    } else {
      serviceAccount = rawCreds;
    }

    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    firestoreDb = initFirestore();
    firestoreDb.settings({ ignoreUndefinedProperties: true });
    console.log('[Database] Firestore successfully initialized via firebase-admin');
    return firestoreDb;
  } catch (err) {
    console.error('[Database] Failed to initialize Firestore from FIREBASE_SERVICE_ACCOUNT_JSON:', err);
    return null;
  }
}

// ----------------------------------------------------
// Database Seeding: ONLY products, categories, coupons & default site settings if empty
// (No fake orders, no fake customers)
// ----------------------------------------------------
export async function seedDatabaseIfEmpty(): Promise<void> {
  const db = getFirestore();

  if (db) {
    try {
      // 1. Products
      const prodSnapshot = await db.collection('products').limit(1).get();
      if (prodSnapshot.empty) {
        console.log('[Database] Seeding initial products to Firestore...');
        const batch = db.batch();
        for (const p of INITIAL_PRODUCTS) {
          batch.set(db.collection('products').doc(p.id), p);
        }
        await batch.commit();
      }

      // 2. Categories
      const catSnapshot = await db.collection('categories').limit(1).get();
      if (catSnapshot.empty) {
        console.log('[Database] Seeding initial categories to Firestore...');
        const batch = db.batch();
        for (const c of INITIAL_CATEGORIES) {
          batch.set(db.collection('categories').doc(c.id), c);
        }
        await batch.commit();
      }

      // 3. Coupons
      const couponSnapshot = await db.collection('coupons').limit(1).get();
      if (couponSnapshot.empty) {
        console.log('[Database] Seeding initial coupons to Firestore...');
        const batch = db.batch();
        for (const c of INITIAL_COUPONS) {
          const couponWithMeta: Coupon = {
            ...c,
            usedCount: 0,
            usageLimit: 500,
          };
          batch.set(db.collection('coupons').doc(c.code.toUpperCase()), couponWithMeta);
        }
        await batch.commit();
      }

      // 4. Settings: siteSettings
      const siteSettingsDoc = await db.collection('settings').doc('siteSettings').get();
      if (!siteSettingsDoc.exists) {
        console.log('[Database] Seeding default site settings to Firestore...');
        await db.collection('settings').doc('siteSettings').set(DEFAULT_SITE_SETTINGS);
      }

      // 5. Settings: telegramConfig
      const tgDoc = await db.collection('settings').doc('telegramConfig').get();
      if (!tgDoc.exists) {
        await db.collection('settings').doc('telegramConfig').set({
          botToken: process.env.TELEGRAM_BOT_TOKEN || '',
          chatId: process.env.TELEGRAM_CHAT_ID || '',
          enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
          lastTestedAt: new Date().toISOString(),
        });
      }

      // 6. Settings: counters
      const countersDoc = await db.collection('settings').doc('counters').get();
      if (!countersDoc.exists) {
        await db.collection('settings').doc('counters').set({ nextOrderNumber: 1001 });
      }

      console.log('[Database] Firestore checks & seeding completed.');
      return;
    } catch (err) {
      console.error('[Database] Error during Firestore seed:', err);
    }
  }

  // Memory store fallback seeding
  if (memStore.products.size === 0) {
    INITIAL_PRODUCTS.forEach(p => memStore.products.set(p.id, { ...p }));
  }
  if (memStore.categories.size === 0) {
    INITIAL_CATEGORIES.forEach(c => memStore.categories.set(c.id, { ...c }));
  }
  if (memStore.coupons.size === 0) {
    INITIAL_COUPONS.forEach(c => memStore.coupons.set(c.code.toUpperCase(), { ...c, usedCount: 0, usageLimit: 500 }));
  }
}

// ----------------------------------------------------
// 1. Products Operations
// ----------------------------------------------------
export async function getProducts(filter?: {
  category?: string;
  search?: string;
  hot?: boolean;
  featured?: boolean;
  sort?: string;
}): Promise<Product[]> {
  const db = getFirestore();
  let list: Product[] = [];

  if (db) {
    const snapshot = await db.collection('products').get();
    list = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Product);
  } else {
    list = Array.from(memStore.products.values());
  }

  if (filter?.category && filter.category !== 'all') {
    list = list.filter(p => p.category === filter.category);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(p =>
      p.nameEn.toLowerCase().includes(q) ||
      p.nameBn.includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.descriptionEn.toLowerCase().includes(q)
    );
  }

  if (filter?.hot) {
    list = list.filter(p => p.isHot);
  }

  if (filter?.featured) {
    list = list.filter(p => p.isFeatured);
  }

  if (filter?.sort === 'price_asc') {
    list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (filter?.sort === 'price_desc') {
    list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (filter?.sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (filter?.sort === 'newest') {
    list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  return list;
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection('products').doc(idOrSlug).get();
    if (doc.exists) return doc.data() as Product;

    // Check by slug
    const snapshot = await db.collection('products').where('slug', '==', idOrSlug).limit(1).get();
    if (!snapshot.empty) return snapshot.docs[0].data() as Product;
    return null;
  }

  return memStore.products.get(idOrSlug) ||
    Array.from(memStore.products.values()).find(p => p.slug === idOrSlug) ||
    null;
}

export async function saveProduct(product: Product): Promise<Product> {
  const db = getFirestore();
  if (db) {
    await db.collection('products').doc(product.id).set(product, { merge: true });
  } else {
    memStore.products.set(product.id, { ...product });
  }
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) return false;
    await db.collection('products').doc(id).delete();
    return true;
  }

  return memStore.products.delete(id);
}

// ----------------------------------------------------
// 2. Categories Operations
// ----------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection('categories').get();
    if (!snapshot.empty) {
      return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Category);
    }
  }
  return Array.from(memStore.categories.values());
}

// ----------------------------------------------------
// 3. Coupons Operations
// ----------------------------------------------------
export async function getCoupon(code: string): Promise<Coupon | null> {
  const cleanCode = code.toUpperCase().trim();
  const db = getFirestore();
  if (db) {
    const doc = await db.collection('coupons').doc(cleanCode).get();
    if (doc.exists) return doc.data() as Coupon;
    return null;
  }
  return memStore.coupons.get(cleanCode) || null;
}

// ----------------------------------------------------
// 4. Orders Operations (Firestore Transaction for stock + order creation)
// ----------------------------------------------------
export interface CreateOrderParams {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  notes?: string;
  paymentMethod: string;
  trxId?: string;
  senderNumber?: string;
  couponCode?: string;
  items: Array<{
    productId: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }>;
}

export async function createOrderInTransaction(params: CreateOrderParams): Promise<Order> {
  const db = getFirestore();

  if (db) {
    return await db.runTransaction(async (transaction: Transaction) => {
      // 1. READS
      // 1a. Read order counter
      const counterRef = db.collection('settings').doc('counters');
      const counterDoc = await transaction.get(counterRef);
      const nextId = (counterDoc.exists ? counterDoc.data()?.nextOrderNumber : null) || 1001;

      // 1b. Read product documents
      const prodRefs = params.items.map(it => ({
        req: it,
        ref: db.collection('products').doc(it.productId),
      }));
      const prodDocs = await Promise.all(prodRefs.map(p => transaction.get(p.ref)));

      // 1c. Read coupon document if coupon specified
      let couponDoc: DocumentSnapshot | null = null;
      let couponRef: DocumentReference | null = null;
      if (params.couponCode) {
        couponRef = db.collection('coupons').doc(params.couponCode.toUpperCase().trim());
        couponDoc = await transaction.get(couponRef);
      }

      // 1d. Read site settings for delivery fee
      const settingsRef = db.collection('settings').doc('siteSettings');
      const settingsDoc = await transaction.get(settingsRef);
      const activeSettings: SiteSettings = settingsDoc.exists 
        ? (settingsDoc.data() as SiteSettings) 
        : DEFAULT_SITE_SETTINGS;

      // 2. VALIDATIONS & CALCULATIONS
      let verifiedSubtotal = 0;
      const verifiedItems: Order['items'] = [];

      for (let i = 0; i < prodDocs.length; i++) {
        const pDoc = prodDocs[i];
        const reqItem = params.items[i];

        if (!pDoc.exists) {
          throw new Error(`Product '${reqItem.productId}' does not exist in inventory.`);
        }

        const pData = pDoc.data() as Product;
        if (pData.stock < reqItem.quantity) {
          throw new Error(`Insufficient stock for '${pData.nameEn}'. In stock: ${pData.stock}, requested: ${reqItem.quantity}.`);
        }

        const officialPrice = (typeof pData.discountPrice === 'number' && pData.discountPrice > 0)
          ? pData.discountPrice
          : pData.price;

        verifiedSubtotal += officialPrice * reqItem.quantity;

        const orderImg = (pData.images && pData.images[0]?.trim())
          ? pData.images[0].trim()
          : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800';

        verifiedItems.push({
          productId: pData.id,
          productName: pData.nameEn,
          productImage: orderImg,
          price: officialPrice,
          quantity: reqItem.quantity,
          selectedColor: reqItem.selectedColor,
          selectedSize: reqItem.selectedSize,
        });
      }

      // Validate Coupon
      let verifiedDiscount = 0;
      let appliedCoupon: string | undefined = undefined;

      if (couponDoc && couponDoc.exists) {
        const cData = couponDoc.data() as Coupon;
        if (cData.expiryDate && new Date(cData.expiryDate).getTime() < Date.now()) {
          throw new Error(`Coupon '${cData.code}' has expired.`);
        }
        if (cData.usageLimit && (cData.usedCount || 0) >= cData.usageLimit) {
          throw new Error(`Coupon '${cData.code}' usage limit has been reached.`);
        }
        if (!cData.minSpend || verifiedSubtotal >= cData.minSpend) {
          appliedCoupon = cData.code;
          if (cData.discountType === 'percentage') {
            verifiedDiscount = Math.round((verifiedSubtotal * cData.discountValue) / 100);
          } else if (cData.discountType === 'fixed') {
            verifiedDiscount = Math.min(verifiedSubtotal, cData.discountValue);
          }
        }
      }

      // Calculate Delivery Fee
      let verifiedDeliveryFee = 0;
      const isFreeShipping = couponDoc && couponDoc.exists && (couponDoc.data() as Coupon).discountType === 'free_shipping';
      const freeThreshold = activeSettings.freeDeliveryThreshold ?? 2000;

      if (isFreeShipping || verifiedSubtotal >= freeThreshold) {
        verifiedDeliveryFee = 0;
      } else if (params.district.toLowerCase() !== 'dhaka') {
        verifiedDeliveryFee = activeSettings.outsideDhakaDeliveryFee ?? 120;
      } else {
        verifiedDeliveryFee = activeSettings.insideDhakaDeliveryFee ?? 60;
      }

      const verifiedTotalAmount = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedDeliveryFee);

      // 3. WRITES (Atomic)
      const orderId = String(nextId);
      const orderNumber = `7X-${nextId}`;

      // 3a. Increment counter
      transaction.set(counterRef, { nextOrderNumber: nextId + 1 }, { merge: true });

      // 3b. Decrement stock
      for (let i = 0; i < prodDocs.length; i++) {
        const pDoc = prodDocs[i];
        const pData = pDoc.data() as Product;
        const reqItem = params.items[i];
        const newStock = Math.max(0, pData.stock - reqItem.quantity);
        transaction.update(pDoc.ref, { stock: newStock });
      }

      // 3c. Increment coupon usage
      if (couponRef && couponDoc && couponDoc.exists) {
        const currentCount = (couponDoc.data()?.usedCount || 0) + 1;
        transaction.update(couponRef, { usedCount: currentCount });
      }

      // 3d. Build and write new Order
      const newOrder: Order = {
        id: orderId,
        orderNumber,
        customerName: params.customerName,
        phone: params.phone,
        email: params.email || `${params.phone}@customer.7x-shop.com`,
        address: params.address,
        district: params.district,
        notes: params.notes,
        items: verifiedItems,
        subtotal: verifiedSubtotal,
        deliveryFee: verifiedDeliveryFee,
        discount: verifiedDiscount,
        couponCode: appliedCoupon,
        totalAmount: verifiedTotalAmount,
        paymentMethod: params.paymentMethod as any,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        trxId: params.trxId,
        senderNumber: params.senderNumber,
        mfsProvider: ['bkash', 'nagad', 'rocket'].includes(params.paymentMethod) ? (params.paymentMethod as any) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        telegramNotified: false,
        emailNotified: true,
      };

      const orderRef = db.collection('orders').doc(orderId);
      transaction.set(orderRef, newOrder);

      // 3e. Update customer record
      const cleanPhone = params.phone.replace(/[\s-]/g, '');
      const userRef = db.collection('users').doc(`usr-${cleanPhone}`);
      transaction.set(userRef, {
        id: `usr-${cleanPhone}`,
        name: params.customerName,
        phone: cleanPhone,
        email: newOrder.email,
        role: 'customer',
        address: params.address,
        district: params.district,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return newOrder;
    });
  }

  // Memory Fallback Transaction Logic
  const nextId = memStore.nextOrderNumber++;
  const orderId = String(nextId);
  const orderNumber = `7X-${nextId}`;

  // Validate items & stock
  let verifiedSubtotal = 0;
  const verifiedItems: Order['items'] = [];

  for (const it of params.items) {
    const prod = memStore.products.get(it.productId);
    if (!prod) {
      throw new Error(`Product '${it.productId}' not found in inventory`);
    }
    if (prod.stock < it.quantity) {
      throw new Error(`Insufficient stock for '${prod.nameEn}'. In stock: ${prod.stock}, requested: ${it.quantity}.`);
    }
    const officialPrice = (typeof prod.discountPrice === 'number' && prod.discountPrice > 0)
      ? prod.discountPrice
      : prod.price;
    verifiedSubtotal += officialPrice * it.quantity;

    verifiedItems.push({
      productId: prod.id,
      productName: prod.nameEn,
      productImage: (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
      price: officialPrice,
      quantity: it.quantity,
      selectedColor: it.selectedColor,
      selectedSize: it.selectedSize,
    });
  }

  // Validate coupon
  let verifiedDiscount = 0;
  let appliedCoupon: string | undefined = undefined;
  if (params.couponCode) {
    const coupon = memStore.coupons.get(params.couponCode.toUpperCase().trim());
    if (coupon) {
      if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
        throw new Error(`Coupon '${coupon.code}' has expired.`);
      }
      if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
        throw new Error(`Coupon '${coupon.code}' usage limit reached.`);
      }
      if (!coupon.minSpend || verifiedSubtotal >= coupon.minSpend) {
        appliedCoupon = coupon.code;
        if (coupon.discountType === 'percentage') {
          verifiedDiscount = Math.round((verifiedSubtotal * coupon.discountValue) / 100);
        } else if (coupon.discountType === 'fixed') {
          verifiedDiscount = Math.min(verifiedSubtotal, coupon.discountValue);
        }
        coupon.usedCount = (coupon.usedCount || 0) + 1;
      }
    }
  }

  // Delivery fee
  let verifiedDeliveryFee = 0;
  const settings = memStore.siteSettings;
  const freeThreshold = settings.freeDeliveryThreshold ?? 2000;
  if (verifiedSubtotal >= freeThreshold) {
    verifiedDeliveryFee = 0;
  } else if (params.district.toLowerCase() !== 'dhaka') {
    verifiedDeliveryFee = settings.outsideDhakaDeliveryFee ?? 120;
  } else {
    verifiedDeliveryFee = settings.insideDhakaDeliveryFee ?? 60;
  }

  const verifiedTotalAmount = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedDeliveryFee);

  // Decrement stock
  params.items.forEach(it => {
    const p = memStore.products.get(it.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - it.quantity);
    }
  });

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerName: params.customerName,
    phone: params.phone,
    email: params.email || `${params.phone}@customer.7x-shop.com`,
    address: params.address,
    district: params.district,
    notes: params.notes,
    items: verifiedItems,
    subtotal: verifiedSubtotal,
    deliveryFee: verifiedDeliveryFee,
    discount: verifiedDiscount,
    couponCode: appliedCoupon,
    totalAmount: verifiedTotalAmount,
    paymentMethod: params.paymentMethod as any,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    trxId: params.trxId,
    senderNumber: params.senderNumber,
    mfsProvider: ['bkash', 'nagad', 'rocket'].includes(params.paymentMethod) ? (params.paymentMethod as any) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramNotified: false,
    emailNotified: true,
  };

  memStore.orders.set(orderId, newOrder);

  // Save customer
  const cleanPhone = params.phone.replace(/[\s-]/g, '');
  memStore.users.set(`usr-${cleanPhone}`, {
    id: `usr-${cleanPhone}`,
    name: params.customerName,
    phone: cleanPhone,
    email: newOrder.email,
    role: 'customer',
    address: params.address,
    district: params.district,
    createdAt: new Date().toISOString(),
  });

  return newOrder;
}

export async function getOrders(filter?: { status?: string; search?: string }): Promise<Order[]> {
  const db = getFirestore();
  let list: Order[] = [];

  if (db) {
    const snapshot = await db.collection('orders').get();
    list = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Order);
  } else {
    list = Array.from(memStore.orders.values());
  }

  if (filter?.status && filter.status !== 'all') {
    list = list.filter(o => o.orderStatus === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(o =>
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.id && o.id.includes(q))
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function getOrderByNumberAndPhone(orderNumber: string, phone: string): Promise<Order | null> {
  const cleanNum = orderNumber.trim().toUpperCase().replace(/^#/, '');
  const cleanPhone = phone.trim().replace(/[\s-]/g, '');

  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection('orders').get();
    for (const doc of snapshot.docs) {
      const o = doc.data() as Order;
      const oNum = (o.orderNumber || o.id).toUpperCase().replace(/^#/, '');
      const oPhone = o.phone ? o.phone.trim().replace(/[\s-]/g, '') : '';
      if (oNum === cleanNum && oPhone === cleanPhone) {
        return o;
      }
    }
    return null;
  }

  for (const o of memStore.orders.values()) {
    const oNum = (o.orderNumber || o.id).toUpperCase().replace(/^#/, '');
    const oPhone = o.phone ? o.phone.trim().replace(/[\s-]/g, '') : '';
    if (oNum === cleanNum && oPhone === cleanPhone) {
      return o;
    }
  }
  return null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const db = getFirestore();
  if (db) {
    const docRef = db.collection('orders').doc(orderId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const updatedAt = new Date().toISOString();
    await docRef.update({ orderStatus: status, updatedAt });
    return { ...(doc.data() as Order), orderStatus: status, updatedAt };
  }

  const order = memStore.orders.get(orderId);
  if (!order) return null;
  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();
  return order;
}

export async function updateOrderNotificationStatus(orderId: string, telegramNotified: boolean): Promise<void> {
  const db = getFirestore();
  if (db) {
    await db.collection('orders').doc(orderId).set({ telegramNotified }, { merge: true });
  } else {
    const o = memStore.orders.get(orderId);
    if (o) o.telegramNotified = telegramNotified;
  }
}

// ----------------------------------------------------
// 5. Users / Customers Operations
// ----------------------------------------------------
export async function getCustomers(query?: string): Promise<User[]> {
  const db = getFirestore();
  let list: User[] = [];

  if (db) {
    const snapshot = await db.collection('users').get();
    list = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as User).filter((u: User) => u.role === 'customer');
  } else {
    list = Array.from(memStore.users.values()).filter(u => u.role === 'customer');
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(u =>
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getAdminStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
}> {
  const orders = await getOrders();
  const products = await getProducts();
  const customers = await getCustomers();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => o.orderStatus !== 'cancelled' ? sum + o.totalAmount : sum, 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    pendingOrders,
  };
}

// ----------------------------------------------------
// 6. Settings Operations
// ----------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection('settings').doc('siteSettings').get();
    if (doc.exists) return doc.data() as SiteSettings;
  }
  return memStore.siteSettings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = getFirestore();
  if (db) {
    const current = await getSiteSettings();
    const updated: SiteSettings = {
      ...current,
      ...settings,
      trustBadges: {
        ...current.trustBadges,
        ...(settings.trustBadges || {}),
      },
    };
    await db.collection('settings').doc('siteSettings').set(updated, { merge: true });
    return updated;
  }

  memStore.siteSettings = {
    ...memStore.siteSettings,
    ...settings,
    trustBadges: {
      ...memStore.siteSettings.trustBadges,
      ...(settings.trustBadges || {}),
    },
  };
  return memStore.siteSettings;
}

export async function resetSiteSettings(): Promise<SiteSettings> {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)) as SiteSettings;
  const db = getFirestore();
  if (db) {
    await db.collection('settings').doc('siteSettings').set(defaults);
  }
  memStore.siteSettings = defaults;
  return defaults;
}

export async function getTelegramConfig(): Promise<TelegramConfig> {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection('settings').doc('telegramConfig').get();
    if (doc.exists) return doc.data() as TelegramConfig;
  }
  return memStore.telegramConfig;
}

export async function updateTelegramConfig(config: Partial<TelegramConfig>): Promise<TelegramConfig> {
  const db = getFirestore();
  if (db) {
    const current = await getTelegramConfig();
    const updated = { ...current, ...config };
    await db.collection('settings').doc('telegramConfig').set(updated, { merge: true });
    return updated;
  }

  memStore.telegramConfig = { ...memStore.telegramConfig, ...config };
  return memStore.telegramConfig;
}

// ----------------------------------------------------
// 7. Notification Logs Operations
// ----------------------------------------------------
export async function getNotificationLogs(): Promise<NotificationLog[]> {
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection('notificationLogs').orderBy('timestamp', 'desc').limit(50).get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as NotificationLog);
  }
  return memStore.notificationLogs;
}

export async function addNotificationLog(log: NotificationLog): Promise<void> {
  const db = getFirestore();
  if (db) {
    await db.collection('notificationLogs').doc(log.id).set(log);
  } else {
    memStore.notificationLogs.unshift(log);
    if (memStore.notificationLogs.length > 100) {
      memStore.notificationLogs.pop();
    }
  }
}

// ----------------------------------------------------
// 8. Reviews Operations
// ----------------------------------------------------
export async function getReviewsByProduct(productId: string): Promise<ProductReview[]> {
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection('reviews').where('productId', '==', productId).get();
    const revs = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as ProductReview);
    return revs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return Array.from(memStore.reviews.values())
    .filter(r => r.productId === productId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addReview(review: ProductReview): Promise<ProductReview> {
  const db = getFirestore();
  if (db) {
    await db.collection('reviews').doc(review.id).set(review);

    // Update product rating and review count
    const prodDocRef = db.collection('products').doc(review.productId);
    const prodDoc = await prodDocRef.get();
    if (prodDoc.exists) {
      const allRevsSnapshot = await db.collection('reviews').where('productId', '==', review.productId).get();
      const allRevs = allRevsSnapshot.docs.map((d: QueryDocumentSnapshot) => d.data() as ProductReview);
      const avg = allRevs.reduce((sum: number, r: ProductReview) => sum + r.rating, 0) / allRevs.length;
      await prodDocRef.update({
        rating: Number(avg.toFixed(1)),
        reviewCount: allRevs.length,
      });
    }
  } else {
    memStore.reviews.set(review.id, review);
    const prod = memStore.products.get(review.productId);
    if (prod) {
      const prodRevs = Array.from(memStore.reviews.values()).filter(r => r.productId === prod.id);
      const avg = prodRevs.reduce((sum, r) => sum + r.rating, 0) / prodRevs.length;
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = prodRevs.length;
    }
  }

  return review;
}
