import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Bell,
  Send,
  ShoppingBag
} from 'lucide-react';
import { useShopStore } from '../services/store';
import { Product, Order } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';

// User Panel Components
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import { CustomerAccountModal } from '../components/CustomerAccountModal';
import { ShopPage } from '../components/ShopPage';
import { CategoriesPage } from '../components/CategoriesPage';
import { StaticPages } from '../components/StaticPages';

export const UserPanelPage: React.FC = () => {
  const store = useShopStore();
  const t = store.t();

  // Navigation & Page State
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [recentlyPlacedOrder, setRecentlyPlacedOrder] = useState<Order | null>(null);

  // Home Featured Tab
  const [homeProductTab, setHomeProductTab] = useState<'featured' | 'new' | 'hot' | 'best'>('featured');

  const handleNavigate = (page: string, categoryId?: string) => {
    setActivePage(page);
    if (categoryId) {
      setSelectedCategoryFilter(categoryId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickBuy = (product: Product, quantity = 1, color?: string, size?: string) => {
    store.addToCart(product, quantity, color, size);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Filter products for Home sections
  const featuredList = store.products.filter(p => p.isFeatured);
  const newArrivalsList = store.products.filter(p => p.isNew || p.id === 'prod-102' || p.id === 'prod-104');
  const hotDealsList = store.products.filter(p => p.isHot);
  const bestSellersList = store.products.filter(p => p.isBestSeller);

  const displayedHomeProducts = 
    homeProductTab === 'new' 
      ? newArrivalsList 
      : homeProductTab === 'hot' 
      ? hotDealsList 
      : homeProductTab === 'best' 
      ? bestSellersList 
      : featuredList;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-amber-500 selection:text-white">
      {/* Toast Notification Container */}
      {store.liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3">
          <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg shrink-0">
            {store.liveToast.type === 'order' ? <Bell className="w-4 h-4 animate-bounce" /> : <ShoppingBag className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white">{store.liveToast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{store.liveToast.message}</p>
          </div>
        </div>
      )}

      {/* Main Header (Clean User Header without Admin buttons) */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onSelectProduct={prod => setSelectedProduct(prod)}
      />

      {/* Content Routing */}
      <main className="flex-1">
        {/* 1. HOME VIEW */}
        {activePage === 'home' && (
          <div className="space-y-12 pb-16">
            {/* Hero Slider & Trust Badges */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
              <HeroSlider
                onExploreDeals={() => handleNavigate('deals')}
                onShopAll={() => handleNavigate('shop')}
              />
            </section>

            {/* Quick Category Circles */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {t.allCategories}
                </h2>
                <button
                  onClick={() => handleNavigate('categories')}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.viewAll}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                {INITIAL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryFilter(cat.id);
                      handleNavigate('shop', cat.id);
                    }}
                    className="group bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition text-center flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-slate-100 group-hover:scale-105 transition-transform border border-slate-100">
                      <img src={cat.image} alt={cat.nameEn} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {store.language === 'bn' ? cat.nameBn : cat.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {cat.itemCount} items
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Interactive Curated Tabs: Featured, New, Hot, Best Sellers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {store.language === 'bn' ? 'বিশেষ পণ্য সংগ্রহ' : 'Curated Collections'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    100% authentic tech accessories with Cash on Delivery and fast nationwide shipping.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto text-xs font-semibold">
                  <button
                    onClick={() => setHomeProductTab('featured')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      homeProductTab === 'featured'
                        ? 'bg-white text-slate-950 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {t.featuredProducts}
                  </button>
                  <button
                    onClick={() => setHomeProductTab('new')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      homeProductTab === 'new'
                        ? 'bg-white text-slate-950 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {t.newArrivals}
                  </button>
                  <button
                    onClick={() => setHomeProductTab('hot')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      homeProductTab === 'hot'
                        ? 'bg-white text-red-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    🔥 {t.deals}
                  </button>
                  <button
                    onClick={() => setHomeProductTab('best')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      homeProductTab === 'best'
                        ? 'bg-white text-slate-950 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {t.bestSellers}
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayedHomeProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={prod => setSelectedProduct(prod)}
                    onQuickBuy={prod => handleQuickBuy(prod)}
                  />
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => handleNavigate('shop')}
                  className="px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{t.viewAll} ({store.products.length} Products)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Telegram Order Notification Highlight Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>Instant Telegram Notifications</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    {store.language === 'bn' 
                      ? 'অর্ডার করলেই সাথে সাথে অ্যাডমিনের টেলিগ্রামে অ্যালার্ট' 
                      : 'Real-time Telegram Order Dispatch Automation'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Whenever an order is placed, customer details, product items, and delivery address are immediately transmitted to the Telegram bot channel and admin live queue.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Live Bot Active</span>
                    </span>
                    <span>·</span>
                    <span>Sound Chimes Enabled</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl w-full lg:w-auto font-mono text-xs text-slate-300 max-w-md">
                  <div className="text-sky-400 font-bold mb-2 flex items-center justify-between text-[11px]">
                    <span>DISPATCH PREVIEW</span>
                    <span className="text-slate-600">@shop7x_orders</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
{`🔔 New Order Received

Order ID: #1004
Customer Name: Tanvir Hossain
Phone: 01712345678
Product: 7X UltraWatch Pro 2.04" AMOLED
Amount: ৳2,850
Payment: Cash on Delivery (COD)`}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. SHOP ALL PAGE */}
        {activePage === 'shop' && (
          <ShopPage
            initialCategory={selectedCategoryFilter}
            onSelectProduct={prod => setSelectedProduct(prod)}
            onQuickBuy={prod => handleQuickBuy(prod)}
          />
        )}

        {/* 3. CATEGORIES PAGE */}
        {activePage === 'categories' && (
          <CategoriesPage
            onSelectCategory={catId => {
              setSelectedCategoryFilter(catId);
              handleNavigate('shop', catId);
            }}
          />
        )}

        {/* 4. HOT DEALS PAGE */}
        {activePage === 'deals' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded">
                Special Limited Deals
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.flashSale}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Exclusive discounts with Cash on Delivery and free doorstep delivery on orders over ৳2,000.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-4">
              {hotDealsList.concat(store.products.filter(p => p.discountPrice && !p.isHot)).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={prod => setSelectedProduct(prod)}
                  onQuickBuy={prod => handleQuickBuy(prod)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 5. STATIC PAGES: CONTACT, PRIVACY, TERMS */}
        {(activePage === 'contact' || activePage === 'privacy' || activePage === 'terms') && (
          <StaticPages
            page={activePage as 'contact' | 'privacy' | 'terms'}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={(prod, qty, col, sz) => {
            setSelectedProduct(null);
            handleQuickBuy(prod, qty, col, sz);
          }}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onShopMore={() => {
          setIsCartOpen(false);
          handleNavigate('shop');
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={order => {
          setRecentlyPlacedOrder(order);
        }}
      />

      <OrderSuccessModal
        order={recentlyPlacedOrder}
        onClose={() => setRecentlyPlacedOrder(null)}
        onViewAccountOrders={() => {
          setRecentlyPlacedOrder(null);
          setIsAccountOpen(true);
        }}
        onContinueShopping={() => {
          setRecentlyPlacedOrder(null);
          handleNavigate('shop');
        }}
      />

      <CustomerAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* Footer (Clean, without Admin Terminal link) */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};
