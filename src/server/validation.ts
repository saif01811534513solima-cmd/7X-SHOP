import { z } from 'zod';

// ----------------------------------------------------
// Admin Login & Password
// ----------------------------------------------------
export const AdminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required').max(200),
}).strict();

export const AdminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(200),
  newPassword: z.string()
    .min(12, 'New password must be at least 12 characters')
    .max(200, 'Password is too long')
    .refine(val => val !== 'admin123' && val.toLowerCase() !== 'password', {
      message: 'Insecure default passwords like admin123 are not permitted',
    }),
}).strict();

// ----------------------------------------------------
// Product Create & Update (Strict field whitelisting)
// ----------------------------------------------------
export const ProductSchema = z.object({
  id: z.string().max(100).optional(),
  slug: z.string().max(200).optional(),
  nameEn: z.string().min(2, 'English name must be at least 2 characters').max(250),
  nameBn: z.string().min(2, 'Bangla name must be at least 2 characters').max(250).optional(),
  category: z.string().min(1, 'Category is required').max(100),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive('Discount price must be greater than 0').optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  sku: z.string().max(100).optional(),
  brand: z.string().max(150).optional(),
  images: z.array(z.string().url('Images must be valid URLs')).max(10).optional(),
  descriptionEn: z.string().max(5000).optional(),
  descriptionBn: z.string().max(5000).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  colors: z.array(z.string().max(50)).optional(),
  sizes: z.array(z.string().max(50)).optional(),
  isHot: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
}).strict();

export const ProductUpdateSchema = ProductSchema.partial();

// ----------------------------------------------------
// Orders
// ----------------------------------------------------
export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(100),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Maximum 50 units per product'),
  selectedColor: z.string().max(50).optional(),
  selectedSize: z.string().max(50).optional(),
}).strict();

export const OrderCreateSchema = z.object({
  customerName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be at most 15 digits'),
  email: z.string().email('Invalid email address').max(150).optional().or(z.literal('')),
  address: z.string().min(5, 'Delivery address must be at least 5 characters').max(300),
  district: z.string().min(2).max(100).default('Dhaka'),
  notes: z.string().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'rocket', 'card']),
  trxId: z.string().max(50).optional().or(z.literal('')),
  senderNumber: z.string().max(20).optional().or(z.literal('')),
  couponCode: z.string().max(50).optional().or(z.literal('')),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least 1 item'),
}).strict();

export const OrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled',
  }),
}).strict();

// ----------------------------------------------------
// Telegram Config
// ----------------------------------------------------
export const TelegramConfigSchema = z.object({
  botToken: z.string().max(200).optional(),
  chatId: z.string().max(100).optional(),
  enabled: z.boolean().optional(),
}).strict();

// ----------------------------------------------------
// Reviews
// ----------------------------------------------------
export const ProductReviewSchema = z.object({
  productId: z.string().min(1).max(100),
  customerName: z.string().min(1).max(100).default('Verified Buyer'),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).default(''),
}).strict();

// ----------------------------------------------------
// Site Settings
// ----------------------------------------------------
export const HeroSlideSchema = z.object({
  id: z.string(),
  tagEn: z.string().max(150),
  tagBn: z.string().max(150),
  titleEn: z.string().max(200),
  titleBn: z.string().max(200),
  descEn: z.string().max(500),
  descBn: z.string().max(500),
  buttonEn: z.string().max(100),
  buttonBn: z.string().max(100),
  image: z.string().url(),
  badge: z.string().max(50).optional(),
  actionType: z.enum(['shop', 'deals', 'categories', 'contact', 'url']),
  actionTarget: z.string().optional(),
  isActive: z.boolean(),
});

export const TrustBadgesSchema = z.object({
  codTextEn: z.string().optional(),
  codTextBn: z.string().optional(),
  deliveryTextEn: z.string().optional(),
  deliveryTextBn: z.string().optional(),
  returnTextEn: z.string().optional(),
  returnTextBn: z.string().optional(),
  warrantyTextEn: z.string().optional(),
  warrantyTextBn: z.string().optional(),
});

export const SiteSettingsSchema = z.object({
  storeName: z.string().max(100).optional(),
  logoText: z.string().max(50).optional(),
  taglineEn: z.string().max(200).optional(),
  taglineBn: z.string().max(200).optional(),
  helplinePhone: z.string().max(50).optional(),
  whatsappNumber: z.string().max(50).optional(),
  supportEmail: z.string().email().optional().or(z.literal('')),
  officeAddressEn: z.string().max(300).optional(),
  officeAddressBn: z.string().max(300).optional(),
  workingHoursEn: z.string().max(100).optional(),
  workingHoursBn: z.string().max(100).optional(),
  insideDhakaDeliveryTime: z.string().max(100).optional(),
  outsideDhakaDeliveryTime: z.string().max(100).optional(),
  showTopBar: z.boolean().optional(),
  topBarAnnouncementEn: z.string().max(300).optional(),
  topBarAnnouncementBn: z.string().max(300).optional(),
  insideDhakaDeliveryFee: z.number().min(0).optional(),
  outsideDhakaDeliveryFee: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional(),
  heroSlides: z.array(HeroSlideSchema).optional(),
  trustBadges: TrustBadgesSchema.optional(),
}).passthrough();
