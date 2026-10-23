import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Share2,
  Copy,
  CheckCircle2,
  Tag,
  AlertCircle,
  ThumbsUp,
  MessageSquarePlus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';
import { Product } from '../types';
import { useShopStore } from '../services/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number, color?: string, size?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const store = useShopStore();
  const t = store.t();

  const fallbackModalImg = (product?.images && product.images.length > 0 && product.images[0])
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800';

  // All React Hooks MUST be called unconditionally at the top
  const [activeImage, setActiveImage] = useState<string>(fallbackModalImg);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<boolean>(false);
  const [reviewName, setReviewName] = useState<string>(store.currentUser?.name || '');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'delivery'>('overview');

  // Sync state whenever product changes or modal is opened
  useEffect(() => {
    if (product) {
      const defaultImg = (product.images && product.images.length > 0 && product.images[0])
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800';
      setActiveImage(defaultImg);
      setActiveImageIndex(0);
      setSelectedVariant(product.colors?.[0] || 'Standard');
      setQuantity(1);
      setCouponCode('');
      setCouponApplied(null);
      setCouponError('');
      setReviewSuccess(false);
      setReviewError('');
      setReviewComment('');
      setActiveTab('overview');
    }
  }, [product?.id]);

  // Safe early exit AFTER all hooks are registered
  if (!product) return null;

  // Active Gallery Images
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'];

  const availableVariants = product.colors && product.colors.length > 0 
    ? product.colors 
    : ['Standard'];

  // Pricing calculations
  const productReviews = store.reviews.filter(r => r.productId === product.id);
  const originalPrice = product.price;
  const currentBasePrice = product.discountPrice || product.price;
  const unitDiscount = product.discountPrice ? originalPrice - product.discountPrice : 0;
  
  // Calculate price with coupon if applied
  const finalUnitPrice = couponApplied 
    ? Math.max(0, currentBasePrice - couponApplied.discountAmount) 
    : currentBasePrice;
  const finalTotalPrice = finalUnitPrice * quantity;

  // Sold count estimation based on reviews & stock
  const soldCount = Math.max(12, product.reviewCount * 3 + 8);

  const handleThumbnailClick = (img: string, index: number) => {
    setActiveImage(img);
    setActiveImageIndex(index);
  };

  const handleNextImage = () => {
    const nextIdx = (activeImageIndex + 1) % productImages.length;
    setActiveImageIndex(nextIdx);
    setActiveImage(productImages[nextIdx]);
  };

  const handlePrevImage = () => {
    const prevIdx = (activeImageIndex - 1 + productImages.length) % productImages.length;
    setActiveImageIndex(prevIdx);
    setActiveImage(productImages[prevIdx]);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');

    const res = await store.applyCoupon(couponCode);
    setIsApplyingCoupon(false);

    if (res.success && store.appliedCoupon) {
      let discountValue = 0;
      if (store.appliedCoupon.discountType === 'percentage') {
        discountValue = Math.round((currentBasePrice * store.appliedCoupon.discountValue) / 100);
      } else {
        discountValue = store.appliedCoupon.discountValue;
      }
      setCouponApplied({
        code: store.appliedCoupon.code,
        discountAmount: discountValue,
        message: res.message
      });
      store.showToast('Coupon Applied', `Code ${store.appliedCoupon.code} applied successfully!`, 'success');
    } else {
      setCouponError(res.message);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.nameEn,
      text: `${product.nameEn} - Order now on 7X_SHOP!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareFeedback(true);
      store.showToast('Link Copied', 'Product link copied to clipboard!');
      setTimeout(() => setShareFeedback(false), 2500);
    } catch {
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    }
  };

  const handleAddToCart = () => {
    store.addToCart(product, quantity, selectedVariant, product.sizes?.[0]);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity, selectedVariant, product.sizes?.[0]);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError(store.language === 'bn' ? 'অনুগ্রহ করে আপনার রিভিউ মন্তব্য লিখুন।' : 'Please enter your review comment.');
      return;
    }
    setReviewError('');
    store.addReview(product.id, reviewRating, reviewComment.trim(), reviewName.trim() || 'Verified Customer');
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  const displayName = store.language === 'bn' ? product.nameBn : product.nameEn;
  const displayDescription = store.language === 'bn' ? product.descriptionBn : product.descriptionEn;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl md:rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition-transform active:scale-95 border border-slate-200 cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          
          {/* TOP SECTION: PHOTO GALLERY & MAIN DISPLAY */}
          <div className="bg-slate-50/60 p-4 sm:p-6 flex flex-col items-center">
            {/* Main Active Photo Container */}
            <div className="relative w-full max-w-md aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-xs flex items-center justify-center group">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={displayName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                  {displayName}
                </div>
              )}

              {/* Navigation arrows for images */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md transition cursor-pointer"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md transition cursor-pointer"
                    title="Next Image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              <div className="absolute bottom-2.5 right-2.5 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                {activeImageIndex + 1} / {productImages.length}
              </div>

              {/* Discount Ribbon if on sale */}
              {unitDiscount > 0 && (
                <div className="absolute top-3 left-3 bg-[#e11d48] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs tracking-tight">
                  -{Math.round((unitDiscount / originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Carousel Strip (Matches Screenshot: red/pink border on active thumbnail) */}
            {productImages.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 mt-3.5 overflow-x-auto max-w-full pb-1 px-2">
                {productImages.map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleThumbnailClick(img, idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-white ${
                        isActive
                          ? 'border-[#e11d48] ring-2 ring-pink-500/20 scale-105 shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`Preview thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN PRODUCT DETAILS SECTION (Matches uploaded screenshot layout) */}
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Title & Share Icon Row */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                {displayName}
              </h1>
              
              <button
                type="button"
                onClick={handleShare}
                className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition shrink-0 cursor-pointer border border-slate-200/60"
                title="Share this product"
              >
                {shareFeedback ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Pricing Row: Vibrant Pink/Red Price + Strikethrough + Discount */}
            <div className="flex items-baseline flex-wrap gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-[#e11d48] tracking-tight">
                ৳ {finalTotalPrice.toLocaleString('en-US')}
              </span>
              
              {product.discountPrice && (
                <>
                  <span className="text-sm sm:text-base text-slate-400 font-semibold line-through">
                    ৳ {(originalPrice * quantity).toLocaleString('en-US')}
                  </span>
                  <span className="text-xs font-bold text-[#e11d48] bg-rose-50 px-2 py-0.5 rounded">
                    -{((originalPrice - currentBasePrice) * quantity)}৳
                  </span>
                </>
              )}

              {couponApplied && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Coupon: {couponApplied.code} (-৳{couponApplied.discountAmount * quantity})
                </span>
              )}
            </div>

            {/* Rating & Sold Stats Row (Matches screenshot: ⭐ 0/5 (0) • 0 Sold) */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                <span>{product.rating > 0 ? product.rating : '0'}/5</span>
                <span className="text-slate-500 font-normal">({product.reviewCount})</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-medium">
                {soldCount} Sold
              </span>
            </div>

            {/* Available Variant (Matches screenshot: Checkbox + Variant name + Stock) */}
            <div className="pt-2">
              <label className="text-sm font-bold text-slate-900 block mb-2">
                {store.language === 'bn' ? 'উপলব্ধ ভ্যারিয়েন্ট (Available variant):' : 'Available variant:'}
              </label>

              <div className="flex flex-wrap gap-2.5">
                {availableVariants.map(variant => {
                  const isChecked = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs transition cursor-pointer text-left ${
                        isChecked
                          ? 'border-[#e11d48] bg-rose-50/50 text-slate-950 font-semibold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#e11d48] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block text-slate-900">{variant}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Status & Delivery Time (Matches screenshot: In Stock in green & Delivery time: 3-5 days) */}
            <div className="space-y-1 pt-1 text-xs">
              <div className="font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>{store.language === 'bn' ? 'ইন স্টক (In Stock)' : 'In Stock'}</span>
              </div>
              <div className="text-slate-600 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {store.language === 'bn' ? 'ডেলিভারি সময়: ৩-৫ দিন' : 'Delivery time: 3-5 days'}
                </span>
              </div>
            </div>

            {/* Quantity Stepper Row (Matches screenshot: Quantity - [ 1 ] +) */}
            <div className="flex items-center gap-4 pt-1">
              <label className="text-sm font-bold text-slate-900 min-w-16">
                {store.language === 'bn' ? 'পরিমাণ:' : 'Quantity'}
              </label>

              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition text-base cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 h-8 flex items-center justify-center text-xs font-bold text-slate-900 bg-white border-x border-slate-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition text-base cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Discount Coupon Input Box (Matches screenshot: Discount coupon : [ Enter code ]) */}
            <div className="pt-2">
              <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs font-bold text-slate-800 shrink-0">
                  {store.language === 'bn' ? 'ডিসকাউন্ট কুপন:' : 'Discount coupon :'}
                </label>
                
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError('');
                      }}
                      placeholder={store.language === 'bn' ? 'কুপন কোড দিন (যেমন: 7XSPECIAL)' : 'Enter code (e.g. 7XSPECIAL)'}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0"
                  >
                    {isApplyingCoupon ? '...' : (store.language === 'bn' ? 'প্রয়োগ করুন' : 'Apply')}
                  </button>
                </div>
              </form>

              {couponError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  ⚠️ {couponError}
                </p>
              )}
            </div>

            {/* ACTION BUTTONS (Matches screenshot: Teal 'Buy Now' + Outline Pink 'Add to Cart') */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              {/* Buy Now (Teal solid button from screenshot) */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-5 bg-[#00c58e] hover:bg-[#00b07e] active:bg-[#009b6e] disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#00c58e]/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{store.language === 'bn' ? 'সরাসরি অর্ডার করুন (Buy Now)' : 'Buy Now'}</span>
              </button>

              {/* Add to Cart (White button with vivid pink border from screenshot) */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-5 bg-white hover:bg-rose-50 active:bg-rose-100 disabled:bg-slate-100 border-2 border-[#e11d48] text-[#e11d48] font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{store.language === 'bn' ? 'কার্টে যোগ করুন (Add to Cart)' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Quick Guarantees Strip */}
            <div className="pt-3 grid grid-cols-3 gap-2 border-t border-slate-100 text-center text-[11px] text-slate-600">
              <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">হোম ডেলিভারি</span>
                <span className="text-[10px] text-slate-500">সারা বাংলাদেশে</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-800">১০০% অরিজিনাল</span>
                <span className="text-[10px] text-slate-500">গ্যারান্টিযুক্ত</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">৭ দিনের রিটার্ন</span>
                <span className="text-[10px] text-slate-500">সহজ পলিসি</span>
              </div>
            </div>

          </div>

          {/* DESCRIPTION & SPECIFICATIONS TABS */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-[#e11d48] text-[#e11d48]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {store.language === 'bn' ? 'পণ্যের বিবরণ' : 'Description'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`pb-2.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-[#e11d48] text-[#e11d48]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {store.language === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'}
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {displayDescription}
                  </p>
                  <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-xl text-amber-900 text-xs space-y-1">
                    <span className="font-bold block">✨ বিশেষ ফিচার:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      <li>উচ্চমানের ড্রিফট মোটরে সুপার স্পিড ও অ্যাক্সিলারেশন</li>
                      <li>প্রিমিয়াম ২.৪ গিগাহার্টজ রিমোট ও স্মুথ কন্ট্রোলিং</li>
                      <li>প্যাকেজে সম্পূর্ণ এক্সেসরিজ ও চার্জিং কেবল অন্তর্ভুক্ত</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="py-2 px-3 flex justify-between gap-4 odd:bg-slate-50/50">
                      <span className="font-bold text-slate-700">{key}</span>
                      <span className="text-slate-600 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DEDICATED CUSTOMER REVIEWS SECTION (নিচে একটা রিভিউ অপশন থাকবে) */}
          <div className="p-4 sm:p-6 bg-slate-50/70 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current text-amber-400" />
                  <span>{store.language === 'bn' ? 'কাস্টমার রিভিউ ও রেটিং' : 'Customer Reviews & Ratings'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {store.language === 'bn' 
                    ? 'এই পণ্যের প্রকৃত গ্রাহকদের রিভিউ ও অভিজ্ঞতা' 
                    : 'Authentic verified reviews and feedback'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-lg font-black text-slate-900">{product.rating}</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? 'fill-current text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">({productReviews.length} Reviews)</span>
              </div>
            </div>

            {/* Write a Review Box (ইউজার নিজের রিভিউ পোস্ট করতে পারবে) */}
            <form onSubmit={handleSubmitReview} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <MessageSquarePlus className="w-4 h-4 text-[#e11d48]" />
                  <span>{store.language === 'bn' ? 'আপনার রিভিউ দিন (Write a Review):' : 'Write a Review:'}</span>
                </span>

                {/* Interactive Star Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">
                    {store.language === 'bn' ? 'রেটিং দিন:' : 'Rating:'}
                  </span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-125 transition-transform cursor-pointer p-0.5"
                      title={`${star} Star`}
                    >
                      <Star
                        className={`w-4 h-4 ${star <= reviewRating ? 'fill-current text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-1">
                    {reviewRating}.0
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {store.language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    placeholder={store.language === 'bn' ? 'যেমন: সাকিব হাসান' : 'e.g. John Doe'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11d48] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {store.language === 'bn' ? 'আপনার অভিজ্ঞতা ও মতামত *' : 'Your Review Comment *'}
                </label>
                <textarea
                  value={reviewComment}
                  onChange={e => {
                    setReviewComment(e.target.value);
                    if (reviewError) setReviewError('');
                  }}
                  rows={2}
                  placeholder={store.language === 'bn' ? 'পণ্যটির গুণমান, ডেলিভারি ও ব্যবহার অভিজ্ঞতা কেমন ছিল তা লিখুন...' : 'Share your honest experience with quality, performance, and delivery...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#e11d48] focus:bg-white"
                />
              </div>

              {reviewError && (
                <p className="text-xs text-rose-600 font-semibold">⚠️ {reviewError}</p>
              )}

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{store.language === 'bn' ? 'ধন্যবাদ! আপনার রিভিউ সফলভাবে প্রকাশিত হয়েছে।' : 'Thank you! Your review was submitted successfully.'}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] active:bg-[#9f1239] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shadow-pink-500/20"
                >
                  {store.language === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review'}
                </button>
              </div>
            </form>

            {/* List of Existing Customer Reviews */}
            <div className="space-y-3">
              {productReviews.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-2xl border border-slate-200/80 p-4">
                  <Star className="w-8 h-8 text-amber-300 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500 font-medium">
                    {store.language === 'bn' 
                      ? 'এখনও কোনো রিভিউ যুক্ত হয়নি। পণ্যটি কিনে প্রথম রিভিউ প্রদান করুন!' 
                      : 'No reviews yet for this product. Be the first to share your experience!'}
                  </p>
                </div>
              ) : (
                productReviews.map(rev => (
                  <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {rev.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block leading-tight">{rev.customerName}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Purchase</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
