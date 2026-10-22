import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Search, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useShopStore } from '../services/store';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ShopPageProps {
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  onSelectProduct,
  onQuickBuy,
}) => {
  const store = useShopStore();
  const t = store.t();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular' | 'rating'>('popular');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(6000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dynamic filter calculation
  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          p.nameEn.toLowerCase().includes(q) ||
          p.nameBn.includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.descriptionEn.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Price
      const effectivePrice = p.discountPrice || p.price;
      if (effectivePrice > maxPriceFilter) {
        return false;
      }
      // Stock
      if (onlyInStock && p.stock <= 0) {
        return false;
      }
      // Deals
      if (onlyDeals && (!p.discountPrice || p.discountPrice >= p.price)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      // popular
      return b.reviewCount - a.reviewCount;
    });
  }, [store.products, selectedCategory, searchQuery, maxPriceFilter, onlyInStock, onlyDeals, sortBy]);

  const categories = [
    { id: 'all', nameEn: 'All Categories', nameBn: 'সকল ক্যাটাগরি' },
    { id: 'gadgets', nameEn: 'Smart Gadgets', nameBn: 'স্মার্ট গ্যাজেটস' },
    { id: 'audio', nameEn: 'Headphones & Audio', nameBn: 'হেডফোন ও অডিও' },
    { id: 'accessories', nameEn: 'Tech Accessories', nameBn: 'টেক এক্সেসরিজ' },
    { id: 'wearables', nameEn: 'Watches & Wearables', nameBn: 'ঘড়ি ও ওয়্যারেবলস' },
    { id: 'gaming', nameEn: 'Gaming Gear', nameBn: 'গেমিং গিয়ার' },
    { id: 'lifestyle', nameEn: 'Lifestyle & Bags', nameBn: 'লাইফস্টাইল ও ব্যাগ' },
  ];

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPriceFilter(6000);
    setOnlyInStock(false);
    setOnlyDeals(false);
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {selectedCategory === 'all' 
              ? (store.language === 'bn' ? 'সবগুলো পণ্য' : 'Shop All Products')
              : categories.find(c => c.id === selectedCategory)?.[store.language === 'bn' ? 'nameBn' : 'nameEn']}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredProducts.length} authentic items with Cash on Delivery
          </p>
        </div>

        {/* Sort & Mobile filter button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 text-xs font-medium text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="popular">{t.sortPopular}</option>
              <option value="newest">{t.sortNewest}</option>
              <option value="price_low">{t.sortPriceLow}</option>
              <option value="price_high">{t.sortPriceHigh}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`md:block space-y-6 ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.filterBy}</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-[11px] text-amber-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword search in catalog */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">Search Catalog</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:bg-white focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Categories Selection */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">{t.allCategories}</label>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{store.language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                <span>{t.priceRange}</span>
                <span className="text-amber-600 font-mono">Up to {store.formatPrice(maxPriceFilter)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="6000"
                step="100"
                value={maxPriceFilter}
                onChange={e => setMaxPriceFilter(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>৳500</span>
                <span>৳6,000</span>
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>In-Stock Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={e => setOnlyDeals(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="flex items-center gap-1">
                  <span>Special Discount Deals</span>
                  <Sparkles className="w-3 h-3 text-red-500" />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or clearing keyword search filters to see all available inventory.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onQuickBuy={onQuickBuy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
