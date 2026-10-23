export type Language = 'en' | 'bn';
export type Currency = 'BDT' | 'USD';

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isHot?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  images: string[];
  descriptionEn: string;
  descriptionBn: string;
  specs: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  sku: string;
  brand: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string; // e.g. "1001"
  orderNumber: string; // e.g. "7X-1001"
  customerName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trxId?: string;
  senderNumber?: string;
  mfsProvider?: 'bkash' | 'nagad' | 'rocket';
  createdAt: string;
  updatedAt: string;
  telegramNotified: boolean;
  emailNotified: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  address?: string;
  district?: string;
  createdAt: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  lastTestedAt?: string;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  type: 'telegram' | 'email';
  status: 'success' | 'failed' | 'simulated';
  message: string;
  timestamp: string;
  details?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minSpend?: number;
  descriptionEn: string;
  descriptionBn: string;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
}

export interface MfsMethodConfig {
  enabled: boolean;
  number: string;
  accountType: 'Personal' | 'Merchant' | 'Agent';
  instructionsBn?: string;
  instructionsEn?: string;
}

export interface PaymentSettings {
  cod: {
    enabled: boolean;
    labelEn: string;
    labelBn: string;
    instructionsEn?: string;
    instructionsBn?: string;
  };
  bkash: MfsMethodConfig;
  nagad: MfsMethodConfig;
  rocket: MfsMethodConfig;
  card: {
    enabled: boolean;
    labelEn: string;
    labelBn: string;
    gatewayName: string;
  };
}

export interface HeroSlide {
  id: string;
  tagEn: string;
  tagBn: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  buttonEn: string;
  buttonBn: string;
  image: string;
  badge?: string;
  actionType: 'deals' | 'shop' | 'categories' | 'contact' | 'url';
  actionUrl?: string;
  isActive: boolean;
}

export interface SiteSettings {
  // Store Identity
  storeName: string;
  logoText: string;
  taglineEn: string;
  taglineBn: string;

  // Helplines & Contact
  helplinePhone: string;
  whatsappNumber: string;
  supportEmail: string;
  officeAddressEn: string;
  officeAddressBn: string;
  workingHoursEn: string;
  workingHoursBn: string;
  insideDhakaDeliveryTime: string;
  outsideDhakaDeliveryTime: string;

  // Top Announcement Bar
  showTopBar: boolean;
  topBarAnnouncementEn: string;
  topBarAnnouncementBn: string;

  // Shipping & Delivery Fees
  insideDhakaDeliveryFee: number;
  outsideDhakaDeliveryFee: number;
  freeDeliveryThreshold: number;

  // Footer & Social Links
  footerBioEn: string;
  footerBioBn: string;
  copyrightText: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  telegramChannelUrl: string;

  // Hero Slides
  heroSlides: HeroSlide[];

  // Trust Badges / Guarantees
  trustBadges: {
    codTextEn: string;
    codTextBn: string;
    deliveryTextEn: string;
    deliveryTextBn: string;
    returnTextEn: string;
    returnTextBn: string;
    warrantyTextEn: string;
    warrantyTextBn: string;
  };
}


