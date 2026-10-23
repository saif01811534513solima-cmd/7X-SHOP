import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Send, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  AlertCircle, 
  Save, 
  Volume2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  Check,
  Copy,
  Info,
  RotateCcw,
  Sparkles,
  Lock,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  ArrowRight,
  Star,
  X,
  Sliders,
  Palette
} from 'lucide-react';
import { useShopStore, playOrderNotificationChime, defaultPaymentSettings } from '../services/store';
import { Order, Product, OrderStatus, TelegramConfig, PaymentSettings } from '../types';
import { BkashIcon, NagadIcon, RocketIcon, VisaIcon, MastercardIcon, AmexIcon } from './CheckoutModal';
import { SiteSettingsManager } from './SiteSettingsManager';


// Curated Preset High-Resolution Product Images for 1-Click Gallery Selection
export const PRESET_GALLERY_IMAGES = [
  // RC Cars & Racing
  {
    id: 'rc-1',
    category: 'RC & Drift Cars',
    title: 'Drift Racing Car (M-Power White)',
    url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=900',
  },
  {
    id: 'rc-2',
    category: 'RC & Drift Cars',
    title: 'Rally Drift Action (Blue Sports)',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=900',
  },
  {
    id: 'rc-3',
    category: 'RC & Drift Cars',
    title: '2.4GHz Gun Remote & Box Set',
    url: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?auto=format&fit=crop&q=80&w=900',
  },
  {
    id: 'rc-4',
    category: 'RC & Drift Cars',
    title: 'Chassis & Spare Drift Tires Kit',
    url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=900',
  },
  {
    id: 'rc-5',
    category: 'RC & Drift Cars',
    title: 'Supercar Track Performance',
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=900',
  },
  // Smartwatches
  {
    id: 'wtc-1',
    category: 'Smartwatches',
    title: 'Titanium Smartwatch Ultra Display',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'wtc-2',
    category: 'Smartwatches',
    title: 'Midnight Black AMOLED Watch',
    url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'wtc-3',
    category: 'Smartwatches',
    title: 'Rugged Sport Outdoor Watch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
  },
  // Audio & Earbuds
  {
    id: 'aud-1',
    category: 'Audio & Earbuds',
    title: 'ANC Wireless Earbuds Black',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'aud-2',
    category: 'Audio & Earbuds',
    title: 'Studio Hi-Fi Over-Ear Headphones',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'aud-3',
    category: 'Audio & Earbuds',
    title: 'Wireless Earbuds with Charging Case',
    url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800',
  },
  // Chargers & Gadgets
  {
    id: 'gad-1',
    category: 'Gadgets & Accessories',
    title: 'GaN 65W Fast Charger Compact',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gad-2',
    category: 'Gadgets & Accessories',
    title: 'Mechanical RGB Gaming Keyboard',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gad-3',
    category: 'Gadgets & Accessories',
    title: 'Precision Gaming Sensor Mouse',
    url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
  }
];

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const store = useShopStore();
  const t = store.t();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'telegram' | 'payments' | 'security' | 'site_settings'>('overview');

  
  // Security & Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  // Payment methods edit state
  const [paymentConfig, setPaymentConfig] = useState<PaymentSettings>({ ...(store.paymentSettings || defaultPaymentSettings) });
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');

  // Orders filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Products search & modal state
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');

  // Telegram settings state
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ ...store.telegramConfig });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);

  // New product template form
  const [productForm, setProductForm] = useState<Partial<Product>>({
    nameEn: '',
    nameBn: '',
    category: 'gadgets',
    price: 1999,
    discountPrice: 1599,
    stock: 20,
    brand: '7X Tech',
    sku: `7X-${Date.now().toString().slice(-4)}`,
    descriptionEn: '',
    descriptionBn: '',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
    specs: { 'Warranty': '1 Year' },
    colors: ['Black', 'Silver'],
  });

  // Photo Gallery Picker (2-8 photos) state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gallery handlers
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = productForm.images || [];
    const remainingSlots = 8 - currentImages.length;
    if (remainingSlots <= 0) {
      store.showToast('সীমা পূর্ণ', 'একটি পণ্যে সর্বোচ্চ ৮টি ছবি রাখতে পারবেন।', 'info');
      return;
    }

    const filesToLoad = Array.from(files).slice(0, remainingSlots);
    let loadedCount = 0;
    Array.from(filesToLoad).forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const dataUrl = uploadEvt.target?.result as string;
        if (dataUrl) {
          setProductForm(prev => {
            const list = prev.images || [];
            if (list.length >= 8) return prev;
            return { ...prev, images: [...list, dataUrl] };
          });
          loadedCount++;
          if (loadedCount === filesToLoad.length) {
            store.showToast('ছবি সফলভাবে যোগ হয়েছে', `${loadedCount}টি ছবি ডিভাইস গ্যালারি থেকে যুক্ত হয়েছে।`, 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setIsGalleryOpen(false);
  };

  const handleAddPresetImage = (url: string) => {
    const currentImages = productForm.images || [];
    if (currentImages.length >= 8) {
      store.showToast('সীমা পূর্ণ', 'সর্বোচ্চ ৮টি ছবি যোগ করতে পারবেন।', 'info');
      return;
    }
    if (currentImages.includes(url)) {
      store.showToast('ছবিটি ইতোমধ্যে আছে', 'এই ছবিটি ইতোমধ্যে তালিকায় রয়েছে।', 'info');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
    store.showToast('ছবি যোগ হয়েছে', 'প্রিসেট ছবি সফলভাবে যুক্ত হয়েছে।', 'success');
  };

  const handleAddUrlImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    const currentImages = productForm.images || [];
    if (currentImages.length >= 8) {
      store.showToast('সীমা পূর্ণ', 'সর্বোচ্চ ৮টি ছবি যোগ করতে পারবেন।', 'info');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), customImageUrl.trim()],
    }));
    setCustomImageUrl('');
    setIsGalleryOpen(false);
    store.showToast('ছবি যোগ হয়েছে', 'লিঙ্ক থেকে ছবি যুক্ত হয়েছে।', 'success');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm(prev => {
      const imgs = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return { ...prev, images: imgs };
    });
  };

  const handleSetCoverImage = (indexToCover: number) => {
    setProductForm(prev => {
      const imgs = [...(prev.images || [])];
      if (indexToCover === 0) return prev;
      const [chosen] = imgs.splice(indexToCover, 1);
      imgs.unshift(chosen);
      return { ...prev, images: imgs };
    });
    store.showToast('মূল কভার সেট হয়েছে', 'প্রথম ছবিটি মেইন কভার হিসেবে নির্ধারণ করা হয়েছে।', 'success');
  };

  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    setProductForm(prev => {
      const imgs = [...(prev.images || [])];
      if (toIdx < 0 || toIdx >= imgs.length) return prev;
      const [item] = imgs.splice(fromIdx, 1);
      imgs.splice(toIdx, 0, item);
      return { ...prev, images: imgs };
    });
  };

  // Calculate stats
  const totalOrders = store.orders.length;
  const totalRevenue = store.orders.reduce((sum, o) => o.orderStatus !== 'cancelled' ? sum + o.totalAmount : sum, 0);
  const totalProducts = store.products.length;
  const totalCustomers = store.users.filter(u => u.role === 'customer').length;
  const pendingOrdersCount = store.orders.filter(o => o.orderStatus === 'pending').length;

  // Filtered orders
  const filteredOrders = store.orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
    const matchesSearch = !orderSearchQuery || 
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.phone.includes(orderSearchQuery) ||
      order.id.includes(orderSearchQuery) ||
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered products
  const filteredProducts = store.products.filter(p =>
    !productSearch ||
    p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.nameBn.includes(productSearch) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered customers
  const filteredCustomers = store.users.filter(u =>
    u.role === 'customer' && (
      !customerSearch ||
      u.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      u.phone.includes(customerSearch) ||
      u.email.toLowerCase().includes(customerSearch.toLowerCase())
    )
  );

  // Security Handlers
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPasswordInput) {
      setPasswordError(store.language === 'bn' ? 'দয়া করে বর্তমান পাসওয়ার্ড দিন।' : 'Please enter your current password.');
      return;
    }

    if (newPasswordInput.length < 4) {
      setPasswordError(store.language === 'bn' ? 'নতুন পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।' : 'New password must be at least 4 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError(store.language === 'bn' ? 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।' : 'New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    const result = store.updateAdminPassword(currentPasswordInput, newPasswordInput);
    setIsChangingPass(false);

    if (result.success) {
      setPasswordSuccess(result.message);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setPasswordError(result.message);
    }
  };

  const handleLockAdmin = () => {
    store.lockAdmin();
    onBackToStore();
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    store.updateOrderStatus(orderId, status);
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTelegram(true);
    store.saveTelegramConfig(telegramConfig);
    setTimeout(() => {
      setIsSavingTelegram(false);
      store.showToast('Telegram Config Saved', 'Your bot credentials have been updated.');
    }, 400);
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTestResult(null);
    const result = await store.testTelegram();
    setIsTestingTelegram(false);
    setTestResult(result);
  };

  const handleCreateOrUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.nameEn) return;

    const prodToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      slug: (productForm.nameEn || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      nameEn: productForm.nameEn || '',
      nameBn: productForm.nameBn || productForm.nameEn || '',
      category: productForm.category || 'gadgets',
      price: Number(productForm.price) || 0,
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stock: Number(productForm.stock) || 0,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      sku: productForm.sku || `7X-${Date.now().toString().slice(-4)}`,
      brand: productForm.brand || '7X Brand',
      images: productForm.images && productForm.images.length > 0 
        ? productForm.images 
        : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
      descriptionEn: productForm.descriptionEn || 'Premium authentic merchandise.',
      descriptionBn: productForm.descriptionBn || 'উচ্চমানের অরিজিনাল পণ্য।',
      specs: productForm.specs || { Warranty: '1 Year' },
      colors: productForm.colors || ['Black'],
    };

    store.saveProduct(prodToSave);
    setIsAddProductOpen(false);
    setEditingProduct(null);
    store.showToast('Product Saved', `${prodToSave.nameEn} saved to catalog.`);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setIsAddProductOpen(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">Pending</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded">Processing</span>;
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded">Shipped</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">Delivered</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Admin Top Navigation */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-extrabold text-sm">
            7X
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>7X_SHOP Admin Console</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingOrdersCount} New Orders
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">Order Dispatch & Telegram Automation Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound alert test */}
          <button
            onClick={() => playOrderNotificationChime()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition"
            title="Test Order Alert Chime"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Test Alert Sound</span>
          </button>

          {/* Quick Lock Button */}
          <button
            onClick={handleLockAdmin}
            className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Lock Admin Panel"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">{store.language === 'bn' ? 'লক করুন' : 'Lock'}</span>
          </button>

          {/* Quick Change Password button */}
          <button
            onClick={() => setActiveTab('security')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition border cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Change Admin Password"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{store.language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</span>
          </button>

          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
          >
            ← Back to Storefront
          </button>
        </div>
      </div>

      {/* Admin Submenu Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
            <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full font-bold">
              {totalOrders}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Catalog</span>
            <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full font-bold">
              {totalProducts}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'customers' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers</span>
            <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full font-bold">
              {totalCustomers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'telegram' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-300" />
            <span>Telegram & Notifications</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{store.language === 'bn' ? 'পেমেন্ট মেথড এডিট' : 'Payment Methods'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{store.language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Password & Security'}</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </button>

          <button
            onClick={() => setActiveTab('site_settings')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'site_settings' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-300" />
            <span>{store.language === 'bn' ? 'সাইট ও ব্যানার সেটিংস' : 'Site & Banners'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

        </div>
      </div>

      {/* Main Content View */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>{t.totalRevenue}</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{store.formatPrice(totalRevenue)}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-medium">↑ Real-time tracked revenue</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>{t.totalOrders}</span>
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalOrders}</div>
                <div className="text-[11px] text-amber-400 mt-1 font-medium">
                  {pendingOrdersCount} pending fulfillment
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>{t.totalProducts}</span>
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalProducts}</div>
                <div className="text-[11px] text-slate-400 mt-1">Across 6 categories</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>{t.totalCustomers}</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalCustomers}</div>
                <div className="text-[11px] text-purple-400 mt-1 font-medium">Verified phone & email users</div>
              </div>
            </div>

            {/* Telegram Integration Status Card */}
            <div className="bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-800/60 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Instant Telegram Notifications</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                      ACTIVE & DISPATCHING
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Target Channel / Chat ID: <span className="font-mono text-amber-400">{store.telegramConfig.chatId}</span> · New orders trigger instant smartphone push alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('telegram')}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition"
                >
                  Configure Bot
                </button>
              </div>
            </div>

            {/* Recent Live Orders Queue */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Recent Live Orders</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-slate-700/60">
                {store.orders.slice(0, 5).map(order => (
                  <div key={order.id} className="p-4 hover:bg-slate-750 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400">#{order.id}</span>
                      <div>
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{order.phone} · {order.district}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-white">{store.formatPrice(order.totalAmount)}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{order.paymentMethod}</div>
                      </div>

                      <div>{getStatusBadge(order.orderStatus)}</div>

                      <select
                        value={order.orderStatus}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-amber-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 overflow-x-auto">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      orderStatusFilter === status
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="relative min-w-64">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by customer, phone, or order ID..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Items & Notes</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Telegram Alert</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-750 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-400">
                            #{order.id}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{order.customerName}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{order.phone}</div>
                            <div className="text-slate-400 text-[10px] truncate max-w-xs">{order.address}, {order.district}</div>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <div className="space-y-0.5">
                              {order.items.map((it, i) => (
                                <div key={i} className="truncate text-slate-200">
                                  • {it.productName} <span className="text-amber-400">(x{it.quantity})</span>
                                </div>
                              ))}
                            </div>
                            {order.notes && (
                              <div className="text-[10px] text-amber-300/80 italic mt-1">
                                Note: {order.notes}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 font-bold text-white whitespace-nowrap">
                            {store.formatPrice(order.totalAmount)}
                          </td>
                          <td className="p-3.5 uppercase font-mono text-[11px] text-slate-300">
                            {order.paymentMethod}
                          </td>
                          <td className="p-3.5">
                            {order.telegramNotified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                                <Send className="w-3 h-3" />
                                <span>Sent</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Pending</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {getStatusBadge(order.orderStatus)}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={order.orderStatus}
                              onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-amber-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRODUCT CATALOG MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="relative min-w-64">
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products by name, SKU, brand..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    nameEn: '',
                    nameBn: '',
                    category: 'gadgets',
                    price: 2500,
                    discountPrice: 1990,
                    stock: 15,
                    brand: '7X Tech',
                    sku: `7X-${Date.now().toString().slice(-4)}`,
                    descriptionEn: '',
                    descriptionBn: '',
                    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
                    specs: { Warranty: '1 Year Replacement' },
                  });
                  setIsAddProductOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Catalog Table */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">SKU & Category</th>
                      <th className="p-3.5">Price / Discount</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Rating</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-750 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          {prod.images && prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover rounded bg-slate-900 border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center text-xs text-slate-500 font-bold">
                              7X
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white">{prod.nameEn}</div>
                            <div className="text-slate-400 text-[11px]">{prod.nameBn}</div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-slate-300">{prod.sku}</div>
                          <div className="text-[10px] text-amber-400 uppercase tracking-wider">{prod.category}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{store.formatPrice(prod.discountPrice || prod.price)}</div>
                          {prod.discountPrice && (
                            <div className="text-[10px] text-slate-500 line-through">
                              {store.formatPrice(prod.price)}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`font-semibold ${prod.stock <= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          ★ {prod.rating} ({prod.reviewCount})
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-slate-300 hover:text-amber-400 transition"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {deletingProductId === prod.id ? (
                            <span className="inline-flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-300 font-bold">মুছবেন?</span>
                              <button
                                onClick={() => {
                                  store.deleteProduct(prod.id);
                                  setDeletingProductId(null);
                                  store.showToast('Product Removed', `${prod.nameEn} has been deleted.`);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                হ্যাঁ
                              </button>
                              <button
                                onClick={() => setDeletingProductId(null)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                              >
                                না
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeletingProductId(prod.id)}
                              className="p-1.5 text-slate-300 hover:text-red-400 transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. CUSTOMER MANAGEMENT TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="relative min-w-64">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search customer by name, phone or email..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">District / Address</th>
                    <th className="p-3.5">Registered Date</th>
                    <th className="p-3.5">Total Orders Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredCustomers.map(cust => {
                    const custOrders = store.orders.filter(o => o.phone === cust.phone || (cust.email && o.email === cust.email));
                    return (
                      <tr key={cust.id} className="hover:bg-slate-750 transition-colors">
                        <td className="p-3.5 font-bold text-white">{cust.name}</td>
                        <td className="p-3.5 font-mono text-slate-300">
                          <div>{cust.phone}</div>
                          <div className="text-[11px] text-slate-400 font-sans">{cust.email}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {cust.district || 'Dhaka'} {cust.address ? `· ${cust.address}` : ''}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {new Date(cust.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 font-bold text-amber-400">
                          {custOrders.length} orders
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. TELEGRAM & NOTIFICATIONS TAB */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Telegram Bot Credentials Configuration */}
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Telegram Notification Integration</h3>
                    <p className="text-xs text-slate-400">Connect your Telegram Bot to receive instant notifications on every new order.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveTelegram} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      value={telegramConfig.botToken}
                      onChange={e => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                      placeholder="e.g. 7689234190:AAH-..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-sky-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Obtain your token via @BotFather on Telegram.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Telegram Chat ID / Channel Username
                    </label>
                    <input
                      type="text"
                      value={telegramConfig.chatId}
                      onChange={e => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                      placeholder="e.g. @your_channel or -10012345678"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-sky-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Channel username (e.g. @shop7x_orders) or numeric Chat ID.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="tgEnabled"
                      checked={telegramConfig.enabled}
                      onChange={e => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                      className="rounded text-sky-500 focus:ring-sky-400"
                    />
                    <label htmlFor="tgEnabled" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Enable real-time Telegram alerts on checkout
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-700 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSavingTelegram}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingTelegram ? 'Saving...' : 'Save Telegram Settings'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={isTestingTelegram}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingTelegram ? 'Sending Test...' : 'Send Test Alert'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded-lg text-xs mt-3 flex items-center gap-2 ${
                      testResult.success 
                        ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300' 
                        : 'bg-amber-950/80 border border-amber-700 text-amber-300'
                    }`}>
                      {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Telegram Message Sample Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Telegram Notification Template
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    This exact format is dispatched to your Telegram bot whenever a customer completes checkout:
                  </p>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
{`🔔 *New Order Received*

*Order ID:* #1004
*Customer Name:* Tanvir Hossain
*Phone:* 01712345678
*Product:* 7X UltraWatch Pro 2.04" AMOLED
*Amount:* ৳2,850
*Payment:* Cash on Delivery (COD)
*Address:* House 14, Road 5, Mirpur-2, Dhaka`}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700 text-[11px] text-slate-400">
                  <span>✓ Includes sound chime alert in admin UI</span>
                </div>
              </div>
            </div>

            {/* Notification Dispatch History Logs */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Real-Time Notification Dispatch Logs ({store.notificationLogs.length})
                </h3>
              </div>

              <div className="divide-y divide-slate-700/60 max-h-96 overflow-y-auto">
                {store.notificationLogs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-slate-750 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        <span>Order #{log.orderId}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap bg-slate-950/60 p-2 rounded border border-slate-800">
                      {log.message}
                    </div>
                    {log.details && (
                      <div className="text-[10px] text-emerald-400">
                        Status: {log.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. PAYMENT METHODS EDIT TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Payment Header & Action Bar */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {store.language === 'bn' 
                        ? 'পেমেন্ট মেথড ব্যবস্থাপনা ও নাম্বার এডিট' 
                        : 'Payment Methods & Gateway Configuration'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {store.language === 'bn'
                        ? 'বিকাশ, নগদ, রকেট নম্বর পরিবর্তন করুন এবং গ্রাহকদের জন্য পেমেন্ট অপশন চালু/বন্ধ করুন।'
                        : 'Edit bKash, Nagad, Rocket merchant numbers, account types, and toggle payment channels.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all payment settings and numbers back to default?')) {
                      setPaymentConfig({ ...defaultPaymentSettings });
                      store.updatePaymentSettings(defaultPaymentSettings);
                      store.showToast('Reset Complete', 'Default payment settings restored.', 'info');
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{store.language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingPayments}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSavingPayments(true);
                    store.updatePaymentSettings(paymentConfig);
                    setTimeout(() => {
                      setIsSavingPayments(false);
                      setPaymentSuccessMessage(
                        store.language === 'bn'
                          ? 'পেমেন্ট মেথড সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!'
                          : 'Payment configuration saved! Customer checkout is now updated.'
                      );
                      store.showToast('Payment Methods Saved', 'Storefront checkout updated with latest numbers.', 'success');
                      setTimeout(() => setPaymentSuccessMessage(''), 5000);
                    }, 350);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingPayments 
                      ? (store.language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') 
                      : (store.language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save All Settings')}
                  </span>
                </button>
              </div>
            </div>

            {/* Success Feedback Alert */}
            {paymentSuccessMessage && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 text-xs rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex-1 font-semibold">{paymentSuccessMessage}</div>
                <button onClick={() => setPaymentSuccessMessage('')} className="text-emerald-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Payment Methods Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* 1. bKash Configuration Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <BkashIcon className="w-7 h-7" />
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>bKash (বিকাশ)</span>
                      </h3>
                      <span className="text-[10px] text-pink-400 font-mono">Mobile Financial Service</span>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {paymentConfig.bkash.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentConfig.bkash.enabled}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        bkash: { ...paymentConfig.bkash, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600 relative"></div>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'বিকাশ নম্বর (গ্রাহক যেখানে টাকা পাঠাবে) *' : 'bKash Account Number *'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.bkash.number}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        bkash: { ...paymentConfig.bkash, number: e.target.value }
                      })}
                      placeholder="018XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-pink-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {store.language === 'bn' ? 'চেকআউট পেজে গ্রাহক এই নম্বরটি দেখতে পাবে' : 'Displayed on checkout for customers to copy and pay'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'অ্যাকাউন্টের ধরন (Account Type)' : 'Account Type'}
                    </label>
                    <select
                      value={paymentConfig.bkash.accountType}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        bkash: { ...paymentConfig.bkash, accountType: e.target.value as any }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-pink-500 outline-none"
                    >
                      <option value="Personal">Personal (Send Money / সেন্ড মানি)</option>
                      <option value="Merchant">Merchant (Make Payment / মার্চেন্ট পেমেন্ট)</option>
                      <option value="Agent">Agent (Cash In / এজেন্ট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'গ্রাহকদের জন্য বিশেষ নির্দেশনা (বাংলা)' : 'Instructions for Customers (Bangla)'}
                    </label>
                    <textarea
                      rows={2}
                      value={paymentConfig.bkash.instructionsBn || ''}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        bkash: { ...paymentConfig.bkash, instructionsBn: e.target.value }
                      })}
                      placeholder="আমাদের বিকাশ নম্বরে সেন্ড মানি করুন এবং TrxID দিন।"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Checkout Preview:</span>
                  <span className="text-pink-400 font-mono font-bold">{paymentConfig.bkash.number} ({paymentConfig.bkash.accountType})</span>
                </div>
              </div>

              {/* 2. Nagad Configuration Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <NagadIcon className="w-7 h-7" />
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Nagad (নগদ)</span>
                      </h3>
                      <span className="text-[10px] text-orange-400 font-mono">Mobile Financial Service</span>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {paymentConfig.nagad.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentConfig.nagad.enabled}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        nagad: { ...paymentConfig.nagad, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600 relative"></div>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'নগদ নম্বর (গ্রাহক যেখানে টাকা পাঠাবে) *' : 'Nagad Account Number *'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.nagad.number}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        nagad: { ...paymentConfig.nagad, number: e.target.value }
                      })}
                      placeholder="018XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-orange-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {store.language === 'bn' ? 'চেকআউট পেজে গ্রাহক এই নম্বরটি দেখতে পাবে' : 'Displayed on checkout for customers to copy and pay'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'অ্যাকাউন্টের ধরন (Account Type)' : 'Account Type'}
                    </label>
                    <select
                      value={paymentConfig.nagad.accountType}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        nagad: { ...paymentConfig.nagad, accountType: e.target.value as any }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 outline-none"
                    >
                      <option value="Personal">Personal (Send Money / সেন্ড মানি)</option>
                      <option value="Merchant">Merchant (Make Payment / মার্চেন্ট পেমেন্ট)</option>
                      <option value="Agent">Agent (Cash In / এজেন্ট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'গ্রাহকদের জন্য বিশেষ নির্দেশনা (বাংলা)' : 'Instructions for Customers (Bangla)'}
                    </label>
                    <textarea
                      rows={2}
                      value={paymentConfig.nagad.instructionsBn || ''}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        nagad: { ...paymentConfig.nagad, instructionsBn: e.target.value }
                      })}
                      placeholder="আমাদের নগদ নম্বরে সেন্ড মানি করুন এবং TrxID দিন।"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Checkout Preview:</span>
                  <span className="text-orange-400 font-mono font-bold">{paymentConfig.nagad.number} ({paymentConfig.nagad.accountType})</span>
                </div>
              </div>

              {/* 3. Rocket Configuration Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <RocketIcon className="w-7 h-7" />
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Rocket DBBL (রকেট)</span>
                      </h3>
                      <span className="text-[10px] text-purple-400 font-mono">Dutch-Bangla Bank MFS</span>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {paymentConfig.rocket.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentConfig.rocket.enabled}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        rocket: { ...paymentConfig.rocket, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 relative"></div>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'রকেট নম্বর (গ্রাহক যেখানে টাকা পাঠাবে) *' : 'Rocket Account Number *'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.rocket.number}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        rocket: { ...paymentConfig.rocket, number: e.target.value }
                      })}
                      placeholder="018XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-purple-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {store.language === 'bn' ? 'চেকআউট পেজে গ্রাহক এই নম্বরটি দেখতে পাবে' : 'Displayed on checkout for customers to copy and pay'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'অ্যাকাউন্টের ধরন (Account Type)' : 'Account Type'}
                    </label>
                    <select
                      value={paymentConfig.rocket.accountType}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        rocket: { ...paymentConfig.rocket, accountType: e.target.value as any }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                    >
                      <option value="Personal">Personal (Send Money / সেন্ড মানি)</option>
                      <option value="Merchant">Merchant (Make Payment / মার্চেন্ট পেমেন্ট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'গ্রাহকদের জন্য বিশেষ নির্দেশনা (বাংলা)' : 'Instructions for Customers (Bangla)'}
                    </label>
                    <textarea
                      rows={2}
                      value={paymentConfig.rocket.instructionsBn || ''}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        rocket: { ...paymentConfig.rocket, instructionsBn: e.target.value }
                      })}
                      placeholder="আমাদের রকেট নম্বরে সেন্ড মানি করুন এবং TrxID দিন।"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Checkout Preview:</span>
                  <span className="text-purple-400 font-mono font-bold">{paymentConfig.rocket.number} ({paymentConfig.rocket.accountType})</span>
                </div>
              </div>

              {/* 4. Cash on Delivery (COD) Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      💵
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Cash on Delivery (COD)</h3>
                      <span className="text-[10px] text-emerald-400">Doorstep Payment</span>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {paymentConfig.cod.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentConfig.cod.enabled}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        cod: { ...paymentConfig.cod, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'লেবেল (ইংরেজি)' : 'Display Label (English)'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.cod.labelEn}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        cod: { ...paymentConfig.cod, labelEn: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'লেবেল (বাংলা)' : 'Display Label (Bangla)'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.cod.labelBn}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        cod: { ...paymentConfig.cod, labelBn: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'গ্রাহক ডেলিভারি নির্দেশিকা' : 'Customer Parcel Note'}
                    </label>
                    <textarea
                      rows={2}
                      value={paymentConfig.cod.instructionsBn || ''}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        cod: { ...paymentConfig.cod, instructionsBn: e.target.value }
                      })}
                      placeholder="পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করুন।"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Method Status:</span>
                  <span className={paymentConfig.cod.enabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {paymentConfig.cod.enabled ? '✓ Enabled on Checkout' : '✗ Hidden from Checkout'}
                  </span>
                </div>
              </div>

              {/* 5. Debit / Credit Card Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <VisaIcon className="w-6 h-4" />
                      <MastercardIcon className="w-6 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Cards (ভিসা / মাস্টারকার্ড)</h3>
                      <span className="text-[10px] text-blue-400">Visa, Mastercard, Amex</span>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {paymentConfig.card.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentConfig.card.enabled}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        card: { ...paymentConfig.card, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {store.language === 'bn' ? 'গেটওয়ে / ডিসপ্লে নাম' : 'Gateway / Display Name'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.card.gatewayName}
                      onChange={e => setPaymentConfig({
                        ...paymentConfig,
                        card: { ...paymentConfig.card, gatewayName: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Security & Encryption Standards</span>
                    </div>
                    <p className="leading-relaxed">
                      All online card transactions require 3D Secure 2.0 OTP authorization through Bangladesh Bank approved payment switches.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Card Processing:</span>
                  <span className={paymentConfig.card.enabled ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                    {paymentConfig.card.enabled ? '✓ Enabled on Checkout' : '✗ Hidden from Checkout'}
                  </span>
                </div>
              </div>

              {/* 6. Live Storefront Synchronization Overview Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Storefront Sync</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {store.language === 'bn' ? 'তাৎক্ষণিক অটো-সিঙ্ক সক্রিয়' : 'Instant Storefront Auto-Sync Active'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {store.language === 'bn' 
                      ? 'আপনি এখানে যে নম্বর ও একাউন্ট টাইপ সেভ করবেন, কাস্টমার চেকআউট ওপেন করার সাথে সাথেই পরিবর্তিত নম্বরটি দেখতে পাবে এবং কপি করতে পারবে।' 
                      : 'Whatever numbers and account types you save here immediately update the customer checkout drawer. Customers will copy the newly configured number for payments.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-700/80 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>bKash Number:</span>
                    <strong className="font-mono text-pink-400">{paymentConfig.bkash.number}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Nagad Number:</span>
                    <strong className="font-mono text-orange-400">{paymentConfig.nagad.number}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Rocket Number:</span>
                    <strong className="font-mono text-purple-400">{paymentConfig.rocket.number}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onBackToStore}
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Storefront Checkout →</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 7. SECURITY & ADMIN PASSWORD TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>{store.language === 'bn' ? 'এডমিন পাসওয়ার্ড ও নিরাপত্তা সেটিংস' : 'Admin Password & Security Settings'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                  {store.language === 'bn' 
                    ? 'আপনার 7X_SHOP শপের সেলস রেকর্ড, কাস্টমার অর্ডার এবং পেমেন্ট মেথড সেটিংস সুরক্ষিত রাখতে নতুন গোপন পাসওয়ার্ড সেট করুন।' 
                    : 'Manage your administrative credentials to protect confidential orders, revenue statistics, and payment configuration.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLockAdmin}
                  className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>{store.language === 'bn' ? 'এখনই লক করুন' : 'Lock Panel Now'}</span>
                </button>
              </div>
            </div>

            {/* Notification messages */}
            {passwordSuccess && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLockAdmin}
                  className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shrink-0 cursor-pointer"
                >
                  {store.language === 'bn' ? 'লক করে টেস্ট করুন' : 'Lock & Test Login'}
                </button>
              </div>
            )}

            {passwordError && (
              <div className="p-4 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Change Password Form */}
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">
                      {store.language === 'bn' ? 'এডমিন পাসওয়ার্ড পরিবর্তন ফর্ম' : 'Change Master Password'}
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded-full font-mono">
                    Protected
                  </span>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{store.language === 'bn' ? 'বর্তমান পাসওয়ার্ড (Current Password) *' : 'Current Password *'}</span>
                      <span className="text-[10px] text-slate-400">Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={currentPasswordInput}
                        onChange={e => {
                          setCurrentPasswordInput(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder="Enter current password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                        title={showCurrentPass ? "Hide password" : "Show password"}
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{store.language === 'bn' ? 'নতুন পাসওয়ার্ড (New Password) *' : 'New Password *'}</span>
                      <span className="text-[10px] text-slate-400">Min 4 chars</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPasswordInput}
                        onChange={e => {
                          setNewPasswordInput(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder="Enter new strong password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                        title={showNewPass ? "Hide password" : "Show password"}
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {store.language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password) *' : 'Confirm New Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPasswordInput}
                        onChange={e => {
                          setConfirmPasswordInput(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder="Re-enter new password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                        title={showConfirmPass ? "Hide password" : "Show password"}
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-700 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>{store.language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'Save New Password'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmPasswordInput('');
                        setPasswordError('');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      {store.language === 'bn' ? 'মুছে ফেলুন' : 'Reset Form'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Security Status & Tips */}
              <div className="space-y-5">
                {/* Status card */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security Status</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Authentication Status</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active & Password Protected</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Admin Master Account</span>
                      <span className="text-white font-mono text-[11px] font-semibold break-all">
                        saif01811534513solima@gmail.com
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Last Password Changed</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {new Date(store.adminPasswordChangedAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80">
                    <button
                      type="button"
                      onClick={handleLockAdmin}
                      className="w-full py-2.5 px-3 bg-slate-900 hover:bg-rose-950 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>{store.language === 'bn' ? 'লক করে শপে ফিরে যান' : 'Lock & Return to Store'}</span>
                    </button>
                  </div>
                </div>

                {/* Best Practice Notice */}
                <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>{store.language === 'bn' ? 'নিরাপত্তা পরামর্শ:' : 'Security Tips:'}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                    <li>{store.language === 'bn' ? 'পাসওয়ার্ডটি কোনো সাধারণ কাস্টমার বা থার্ড পার্টির সাথে শেয়ার করবেন না।' : 'Never share your administrative password with customers.'}</li>
                    <li>{store.language === 'bn' ? 'কাজে বিরতি দিলে উপরের "লক করুন" বাটনে ক্লিক করে রাখুন।' : 'Click "Lock" when stepping away to prevent unauthorized access.'}</li>
                    <li>{store.language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করার পর অবিলম্বে নতুন পাসওয়ার্ড দিয়ে পরীক্ষা করুন।' : 'Verify your new credentials right after updating.'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. SITE SETTINGS & CONTENT CUSTOMIZATION TAB */}
        {activeTab === 'site_settings' && (
          <SiteSettingsManager />
        )}
      </div>



      {/* Add / Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={productForm.nameEn}
                    onChange={e => setProductForm({ ...productForm, nameEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Product Name (Bangla)</label>
                  <input
                    type="text"
                    value={productForm.nameBn}
                    onChange={e => setProductForm({ ...productForm, nameBn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="gadgets">Smart Gadgets</option>
                    <option value="audio">Headphones & Audio</option>
                    <option value="accessories">Tech Accessories</option>
                    <option value="wearables">Watches & Wearables</option>
                    <option value="gaming">Gaming Gear</option>
                    <option value="lifestyle">Lifestyle & Bags</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Discount Price (৳)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice || ''}
                    onChange={e => setProductForm({ ...productForm, discountPrice: Number(e.target.value) || undefined })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                {/* 2 to 8 Images Gallery Section */}
                <div className="col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>পণ্যের ছবি গ্যালারি (২ থেকে ৮টি ছবি) *</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        গ্রাহকদের স্পষ্ট দেখতে ২-৮টি ছবি যুক্ত করুন। ১ম ছবি মূল কভার হিসেবে থাকবে।
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        (productForm.images || []).length >= 2 && (productForm.images || []).length <= 8
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {(productForm.images || []).length}/8 ছবি
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Hidden file input for native gallery/camera selection */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleDeviceFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={(productForm.images || []).length >= 8}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ডিভাইস / ফোন গ্যালারি আপলোড</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      disabled={(productForm.images || []).length >= 8}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>গ্যালারি ওপেন করুন (Picker)</span>
                    </button>
                  </div>

                  {/* Thumbnail Previews Grid */}
                  {(productForm.images || []).length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl text-center space-y-1.5">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">কোনো ছবি যুক্ত করা হয়নি।</p>
                      <p className="text-[11px] text-slate-500">
                        উপরের বাটন দিয়ে ডিভাইস গ্যালারি থেকে বা শপ গ্যালারি থেকে ২-৮টি ছবি বেছে নিন।
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {(productForm.images || []).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group shadow-xs"
                        >
                          {img ? (
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500 font-bold">
                              7X
                            </div>
                          )}
                          
                          {/* Main Cover Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>মেইন কভার</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              className="absolute top-1.5 left-1.5 bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded transition cursor-pointer"
                              title="Set as main cover image"
                            >
                              ★ কভার করুন
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow transition cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Reordering Controls */}
                          <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-300">
                            <span>#{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, idx - 1)}
                                  className="hover:text-amber-400 cursor-pointer p-0.5"
                                  title="Move earlier"
                                >
                                  ←
                                </button>
                              )}
                              {idx < (productForm.images || []).length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, idx + 1)}
                                  className="hover:text-amber-400 cursor-pointer p-0.5"
                                  title="Move later"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(productForm.images || []).length > 0 && (productForm.images || []).length < 2 && (
                    <p className="text-[11px] text-amber-400 font-medium">
                      ⚠️ পরামর্শ: সেরা প্রেজেন্টেশনের জন্য অন্তত ২টি ছবি যোগ করুন।
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Overview Description</label>
                  <textarea
                    rows={2}
                    value={productForm.descriptionEn}
                    onChange={e => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-600"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Image Gallery Picker Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  পণ্যের ছবি গ্যালারি ও আপলোডার (২-৮ টি ছবি)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Gallery Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGalleryTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  galleryTab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 ফোন / কম্পিউটার গ্যালারি
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('preset')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  galleryTab === 'preset' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ প্রিসেট ক্যাটালগ গ্যালারি
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('url')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  galleryTab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🔗 লিঙ্ক দিয়ে যুক্ত করুন
              </button>
            </div>

            {/* Tab 1: Upload from Device */}
            {galleryTab === 'upload' && (
              <div className="space-y-4 py-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/60 p-8 rounded-2xl text-center cursor-pointer transition hover:bg-slate-950/80 space-y-3"
                >
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      মোবাইল বা কম্পিউটার গ্যালারি থেকে ছবি আপলোড করুন
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      এখানে ক্লিক করে আপনার ফোনের ছবি বা কম্পিউটার থেকে সরাসরি ২ থেকে ৮টি ছবি নির্বাচন করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs pointer-events-none"
                  >
                    গ্যালারি বা ফাইল ম্যানেজার ওপেন করুন
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Curated Presets */}
            {galleryTab === 'preset' && (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {/* Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {['all', 'RC & Drift Cars', 'Smartwatches', 'Audio & Earbuds', 'Gadgets & Accessories'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPresetCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition cursor-pointer ${
                        presetCategoryFilter === cat
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {cat === 'all' ? 'All Presets' : cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_GALLERY_IMAGES
                    .filter(img => presetCategoryFilter === 'all' || img.category === presetCategoryFilter)
                    .map(preset => {
                      const isAdded = (productForm.images || []).includes(preset.url);
                      return (
                        <div
                          key={preset.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group flex flex-col justify-between"
                        >
                          <div className="aspect-square relative bg-slate-900 overflow-hidden">
                            {preset.url ? (
                              <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : null}
                            {isAdded && (
                              <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center text-emerald-400 font-bold text-xs gap-1">
                                <Check className="w-4 h-4" />
                                <span>যোগ করা হয়েছে</span>
                              </div>
                            )}
                          </div>
                          <div className="p-2 space-y-1.5">
                            <p className="text-[11px] font-semibold text-slate-300 line-clamp-1">{preset.title}</p>
                            <button
                              type="button"
                              onClick={() => handleAddPresetImage(preset.url)}
                              disabled={isAdded || (productForm.images || []).length >= 8}
                              className={`w-full py-1 text-[11px] font-bold rounded-lg transition ${
                                isAdded 
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                              }`}
                            >
                              {isAdded ? 'যোগ করা হয়েছে' : '+ ছবিতে যোগ করুন'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Tab 3: URL Link */}
            {galleryTab === 'url' && (
              <form onSubmit={handleAddUrlImage} className="space-y-3 py-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ছবি লিঙ্ক বা ওয়েব ইউআরএল (Image Web URL):
                  </label>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={e => setCustomImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                {customImageUrl && customImageUrl.trim() ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={customImageUrl.trim()} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!customImageUrl.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  ছবি যোগ করুন
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                বর্তমান মোট ছবি: {(productForm.images || []).length}/8
              </span>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
              >
                সম্পন্ন (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
