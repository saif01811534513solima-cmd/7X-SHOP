import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Globe, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  PhoneCall,
  Bell,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useShopStore } from '../services/store';
import { Product } from '../types';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (page: string, categoryId?: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAccount,
  onSelectProduct,
  onNavigate,
  activePage,
}) => {
  const store = useShopStore();
  const t = store.t();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);

  // Autocomplete search results
  const searchResults = searchQuery.trim()
    ? store.products.filter(p =>
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameBn.includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectSearchResult = (product: Product) => {
    onSelectProduct(product);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Bar */}
      {store.siteSettings?.showTopBar !== false && (
        <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-white tracking-wide">
                {store.language === 'bn' 
                  ? (store.siteSettings?.topBarAnnouncementBn || '⚡ হট অফার: সারা বাংলাদেশে ক্যাশ অন ডেলিভারি এবং ২,০০০ টাকার অর্ডারে ফ্রি শিপিং!') 
                  : (store.siteSettings?.topBarAnnouncementEn || '⚡ FREE Express Doorstep Delivery on orders above ৳2,000 across all 64 districts!')}
              </span>
            </div>


          <div className="flex items-center gap-4 text-slate-300">
            {/* Quick Demo Role Switcher */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
              <span className="text-slate-400">View as:</span>
              <button
                onClick={() => store.switchDemoAccount('customer')}
                className={`px-1.5 py-0.5 rounded transition ${
                  store.currentUser?.role === 'customer' 
                    ? 'bg-amber-500 text-slate-950 font-semibold' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => store.switchDemoAccount('admin')}
                className={`px-1.5 py-0.5 rounded transition ${
                  store.currentUser?.role === 'admin' 
                    ? 'bg-emerald-500 text-white font-semibold' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin (Saif)
              </button>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white transition px-2 py-0.5 rounded hover:bg-slate-800"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{store.language === 'en' ? 'English' : 'বাংলা'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white text-slate-800 rounded-md shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={() => {
                      store.setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 ${
                      store.language === 'en' ? 'font-bold text-amber-600' : ''
                    }`}
                  >
                    <span>English</span>
                    {store.language === 'en' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      store.setLanguage('bn');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 ${
                      store.language === 'bn' ? 'font-bold text-amber-600' : ''
                    }`}
                  >
                    <span>বাংলা (Bangla)</span>
                    {store.language === 'bn' && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <button
                onClick={() => store.setCurrency('BDT')}
                className={`px-1.5 py-0.5 rounded ${
                  store.currency === 'BDT' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                BDT (৳)
              </button>
              <button
                onClick={() => store.setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded ${
                  store.currency === 'USD' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>
      </div>
      )}


      {/* Main Brand & Search Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white font-black text-xl shadow-sm tracking-tighter group-hover:scale-105 transition-transform">
                {store.siteSettings?.logoText || '7X'}
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  {store.siteSettings?.storeName || '7X_SHOP.com'}
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-600 -mt-1">
                  {store.language === 'bn' 
                    ? (store.siteSettings?.taglineBn || 'অনলাইন মার্কেটপ্লেস') 
                    : (store.siteSettings?.taglineEn || 'Online Marketplace')}
                </span>
              </div>
            </button>
          </div>


          {/* Search Bar with Instant Autocomplete */}
          <div className="flex-1 max-w-xl hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:bg-white text-slate-900 placeholder:text-slate-600 text-sm rounded-lg pl-10 pr-20 py-2.5 outline-none transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold text-xs rounded-md transition-colors"
              >
                {store.language === 'bn' ? 'খুঁজুন' : 'Search'}
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 flex items-center justify-between">
                  <span>{store.language === 'bn' ? 'পণ্য পরামর্শ' : 'Product Suggestions'}</span>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-slate-600 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
                {searchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectSearchResult(prod)}
                    className="flex items-center gap-3 p-2.5 hover:bg-amber-50/60 cursor-pointer transition-colors"
                  >
                    {prod.images && prod.images[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.nameEn}
                        className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        7X
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {store.language === 'bn' ? prod.nameBn : prod.nameEn}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {prod.brand} · {prod.category}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-amber-600">
                        {store.formatPrice(prod.discountPrice || prod.price)}
                      </p>
                      {prod.discountPrice && (
                        <p className="text-[10px] text-slate-600 line-through">
                          {store.formatPrice(prod.price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account / Login */}
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">
                {store.currentUser ? store.currentUser.name.split(' ')[0] : t.login}
              </span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold text-xs rounded-lg transition shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">{t.cart}</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-slate-950 text-white text-[11px] font-bold rounded-full">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-600 text-xs rounded-lg pl-9 pr-16 py-2.5 outline-none"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-amber-500 text-slate-950 font-semibold text-[11px] rounded"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Primary Category & Page Navigation Bar */}
      <nav className="bg-slate-50 border-t border-slate-200/70 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 py-2.5 overflow-x-auto scrollbar-none font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-amber-600 transition-colors ${
                activePage === 'home' ? 'text-amber-600 font-bold' : 'text-slate-700'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`hover:text-amber-600 transition-colors ${
                activePage === 'shop' ? 'text-amber-600 font-bold' : 'text-slate-700'
              }`}
            >
              {t.shop}
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className={`hover:text-amber-600 transition-colors ${
                activePage === 'categories' ? 'text-amber-600 font-bold' : 'text-slate-700'
              }`}
            >
              {t.categories}
            </button>
            <button
              onClick={() => onNavigate('deals')}
              className={`hover:text-amber-600 transition-colors flex items-center gap-1 ${
                activePage === 'deals' ? 'text-red-600 font-bold' : 'text-red-600 font-semibold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.deals}</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`hover:text-amber-600 transition-colors ${
                activePage === 'contact' ? 'text-amber-600 font-bold' : 'text-slate-700'
              }`}
            >
              {t.contact}
            </button>
          </div>

          <div className="flex items-center gap-3 py-2 text-slate-500 font-mono text-[11px]">
            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
            <a 
              href={`tel:${store.siteSettings?.helplinePhone || '+8801811534513'}`}
              className="hover:text-amber-600 transition"
            >
              Hotline: {store.siteSettings?.helplinePhone || '+880 1811-534513'}
            </a>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="text-left py-2 font-medium text-slate-800 border-b border-slate-100"
            >
              {t.home}
            </button>
            <button
              onClick={() => { onNavigate('shop'); setMobileMenuOpen(false); }}
              className="text-left py-2 font-medium text-slate-800 border-b border-slate-100"
            >
              {t.shop}
            </button>
            <button
              onClick={() => { onNavigate('categories'); setMobileMenuOpen(false); }}
              className="text-left py-2 font-medium text-slate-800 border-b border-slate-100"
            >
              {t.categories}
            </button>
            <button
              onClick={() => { onNavigate('deals'); setMobileMenuOpen(false); }}
              className="text-left py-2 font-medium text-red-600 border-b border-slate-100"
            >
              🔥 {t.deals}
            </button>
            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className="text-left py-2 font-medium text-slate-800 border-b border-slate-100"
            >
              {t.contact}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              onClick={() => { onOpenAccount(); setMobileMenuOpen(false); }}
              className="font-semibold text-slate-900 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>{store.currentUser ? store.currentUser.name : t.login}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">7X_SHOP Customer</span>
          </div>
        </div>
      )}
    </header>
  );
};
