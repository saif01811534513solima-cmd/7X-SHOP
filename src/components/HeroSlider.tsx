import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Banknote,
  Sparkles
} from 'lucide-react';
import { useShopStore } from '../services/store';

interface HeroSliderProps {
  onExploreDeals: () => void;
  onShopAll: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onExploreDeals, onShopAll }) => {
  const store = useShopStore();
  const t = store.t();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically load active slides from Site Settings
  const allSlides = store.siteSettings?.heroSlides || [];
  const activeSlides = allSlides.filter(s => s.isActive !== false);
  const slides = activeSlides.length > 0 ? activeSlides : allSlides;
  const safeCurrentSlide = slides.length > 0 ? currentSlide % slides.length : 0;

  // Auto slide carousel every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  const handleSlideAction = (slide: any) => {
    if (!slide) return;
    if (slide.actionType === 'deals') {
      onExploreDeals();
    } else if (slide.actionType === 'url' && slide.actionUrl) {
      if (slide.actionUrl.startsWith('http')) {
        window.open(slide.actionUrl, '_blank');
      } else {
        window.location.href = slide.actionUrl;
      }
    } else {
      onShopAll();
    }
  };


  return (
    <div className="space-y-6">
      {/* Hero Carousel */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white shadow-xl min-h-[380px] md:min-h-[440px] flex items-center">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={slides[safeCurrentSlide]?.image}
            alt="Hero Banner"
            className="w-full h-full object-cover object-center opacity-35 transition-all duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{store.language === 'bn' ? slides[safeCurrentSlide]?.tagBn : slides[safeCurrentSlide]?.tagEn}</span>
              {slides[safeCurrentSlide]?.badge && (
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono">
                  {slides[safeCurrentSlide]?.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {store.language === 'bn' ? slides[safeCurrentSlide]?.titleBn : slides[safeCurrentSlide]?.titleEn}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {store.language === 'bn' ? slides[safeCurrentSlide]?.descBn : slides[safeCurrentSlide]?.descEn}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSlideAction(slides[safeCurrentSlide])}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-lg transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>{store.language === 'bn' ? slides[safeCurrentSlide]?.buttonBn : slides[safeCurrentSlide]?.buttonEn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onShopAll}
                className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg border border-slate-700 transition"
              >
                {t.shop}
              </button>
            </div>
          </div>


          {/* Flash Deal Countdown Box */}
          <div className="w-full md:w-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 mb-3 uppercase tracking-wider">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>{t.flashSale}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{t.endsIn}:</p>
            <div className="flex items-center gap-2 font-mono">
              <div className="flex flex-col items-center bg-slate-800 px-3 py-2 rounded border border-slate-700 min-w-14">
                <span className="text-xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase text-slate-400">{t.hours}</span>
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="flex flex-col items-center bg-slate-800 px-3 py-2 rounded border border-slate-700 min-w-14">
                <span className="text-xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase text-slate-400">{t.mins}</span>
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="flex flex-col items-center bg-slate-800 px-3 py-2 rounded border border-slate-700 min-w-14">
                <span className="text-xl font-black text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase text-slate-400">{t.secs}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ Cash on Delivery Available Nationwide
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <button
          onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition border border-slate-800"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition border border-slate-800"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                safeCurrentSlide === i ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 4 Pillars Trust Feature Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {store.language === 'bn' 
                ? (store.siteSettings?.trustBadges?.codTextBn || t.featureCod)
                : (store.siteSettings?.trustBadges?.codTextEn || t.featureCod)}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.featureCodDesc}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {store.language === 'bn' 
                ? (store.siteSettings?.trustBadges?.deliveryTextBn || t.featureDelivery)
                : (store.siteSettings?.trustBadges?.deliveryTextEn || t.featureDelivery)}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.featureDeliveryDesc}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {store.language === 'bn' 
                ? (store.siteSettings?.trustBadges?.warrantyTextBn || t.featureAuthentic)
                : (store.siteSettings?.trustBadges?.warrantyTextEn || t.featureAuthentic)}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.featureAuthenticDesc}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {store.language === 'bn' 
                ? (store.siteSettings?.trustBadges?.returnTextBn || t.featureReturn)
                : (store.siteSettings?.trustBadges?.returnTextEn || t.featureReturn)}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.featureReturnDesc}</p>
          </div>
        </div>
      </div>

    </div>
  );
};
