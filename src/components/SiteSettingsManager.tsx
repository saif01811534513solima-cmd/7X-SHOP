import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Truck, 
  ShieldCheck, 
  ExternalLink, 
  Megaphone, 
  Share2, 
  Info, 
  CheckCircle, 
  X,
  Eye,
  Layers
} from 'lucide-react';
import { useShopStore } from '../services/store';
import { HeroSlide, SiteSettings } from '../types';

// Preset High-Resolution eCommerce Banners for 1-Click Selection
export const PRESET_HERO_BANNERS = [
  {
    id: 'preset-banner-1',
    title: 'Smartwatches & AMOLED Wearables',
    category: 'Gadgets',
    badge: 'Up to 35% OFF',
    url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-2',
    title: 'Mechanical Keyboards & Studio Rig',
    category: 'Gaming',
    badge: 'New Arrivals',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-3',
    title: 'GaN 65W Fast Chargers & MagSafe',
    category: 'Accessories',
    badge: 'Best Sellers',
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-4',
    title: 'High-Fidelity Studio Headphones & Audio',
    category: 'Audio',
    badge: 'Studio Grade',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-5',
    title: 'RC Drift Racing Supercar & Toys',
    category: 'RC & Drift',
    badge: 'Top Trending',
    url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-6',
    title: 'Urban Tech Lifestyle Backpacks',
    category: 'Lifestyle',
    badge: 'Waterproof',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-7',
    title: 'Mega Flash Sale Dark Neon Banner',
    category: 'Deals',
    badge: 'Flash 50% OFF',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'preset-banner-8',
    title: 'Clean Minimalist Workspace & Tech',
    category: 'Workspace',
    badge: 'Trending Gear',
    url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=1200',
  },
];

export const SiteSettingsManager: React.FC = () => {
  const store = useShopStore();
  const currentSettings = store.siteSettings;

  // Active sub-tab in customizer
  const [subTab, setSubTab] = useState<'slides' | 'helpline' | 'topbar' | 'branding' | 'footer'>('slides');

  // Form state for general settings
  const [formState, setFormState] = useState<SiteSettings>({ ...currentSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hero Slide Modal (Add / Edit) State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState<Omit<HeroSlide, 'id'>>({
    tagEn: 'Flash Weekend Mega Sale',
    tagBn: 'উইকেন্ড মেগা ফ্ল্যাশ সেল',
    titleEn: '',
    titleBn: '',
    descEn: '',
    descBn: '',
    buttonEn: 'Explore Deals Now',
    buttonBn: 'অফারগুলো দেখুন',
    image: PRESET_HERO_BANNERS[0].url,
    badge: 'Up to 35% OFF',
    actionType: 'deals',
    actionUrl: '',
    isActive: true,
  });

  // Slide Image Picker Tab
  const [imagePickerTab, setImagePickerTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal state if store updates from another turn
  React.useEffect(() => {
    setFormState({ ...store.siteSettings });
  }, [store.siteSettings]);

  // Open modal for new slide
  const handleOpenAddSlide = () => {
    setEditingSlideId(null);
    setSlideForm({
      tagEn: 'Exclusive New Arrivals',
      tagBn: 'নতুন স্পেশাল অফার',
      titleEn: 'Next-Generation Smart Gadgets & Gear',
      titleBn: 'নতুন প্রজন্মের স্মার্ট গ্যাজেটস ও গিয়ার',
      descEn: 'Enjoy nationwide Cash on Delivery and genuine warranty on every order.',
      descBn: 'সারাদেশে ক্যাশ অন ডেলিভারি এবং প্রতিটি পণ্যে শতভাগ আসল ব্র্যান্ড ওয়ারেন্টি।',
      buttonEn: 'Shop Now',
      buttonBn: 'এখনই কিনুন',
      image: PRESET_HERO_BANNERS[Math.floor(Math.random() * PRESET_HERO_BANNERS.length)].url,
      badge: 'Special Offer',
      actionType: 'deals',
      actionUrl: '',
      isActive: true,
    });
    setIsSlideModalOpen(true);
  };

  // Open modal to edit existing slide
  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideForm({
      tagEn: slide.tagEn,
      tagBn: slide.tagBn,
      titleEn: slide.titleEn,
      titleBn: slide.titleBn,
      descEn: slide.descEn,
      descBn: slide.descBn,
      buttonEn: slide.buttonEn,
      buttonBn: slide.buttonBn,
      image: slide.image,
      badge: slide.badge || '',
      actionType: slide.actionType,
      actionUrl: slide.actionUrl || '',
      isActive: slide.isActive !== false,
    });
    setIsSlideModalOpen(true);
  };

  // Save slide form (Add or Edit)
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.titleEn.trim() && !slideForm.titleBn.trim()) {
      store.showToast('শিরোনাম আবশ্যক', 'দয়া করে স্লাইডের শিরোনাম দিন।', 'info');
      return;
    }
    if (!slideForm.image) {
      store.showToast('ছবি আবশ্যক', 'দয়া করে স্লাইডের একটি ব্যানার ছবি নির্বাচন করুন।', 'info');
      return;
    }

    if (editingSlideId) {
      await store.updateHeroSlide(editingSlideId, slideForm);
      store.showToast('স্লাইড আপডেট হয়েছে', 'স্লাইড সফলভাবে পরিবর্তন করা হয়েছে।', 'success');
    } else {
      await store.addHeroSlide(slideForm);
    }
    setIsSlideModalOpen(false);
  };

  // Delete slide
  const handleDeleteSlide = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই স্লাইডটি মুছে ফেলতে চান?')) {
      await store.deleteHeroSlide(id);
    }
  };

  // Move slide up / down
  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    await store.reorderHeroSlides(index, targetIdx);
  };

  // Toggle slide active
  const handleToggleSlideActive = async (slide: HeroSlide) => {
    await store.updateHeroSlide(slide.id, { isActive: !slide.isActive });
  };

  // Handle device file upload for slide banner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = uploadEvt => {
      const dataUrl = uploadEvt.target?.result as string;
      if (dataUrl) {
        setSlideForm(prev => ({ ...prev, image: dataUrl }));
        store.showToast('ছবি লোড হয়েছে', 'ডিভাইস থেকে ছবি সফলভাবে যুক্ত হয়েছে।', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save General Site Settings
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    await store.updateSiteSettings(formState);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (window.confirm('আপনি কি সমস্ত সেটিংস এবং স্লাইড ফ্যাক্টরি ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?')) {
      await store.resetSiteSettings();
      setFormState({ ...store.siteSettings });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header & Global Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Storefront Content & Customization Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>সাইট ও ব্যানার সম্পূর্ণ কাস্টমাইজেশন</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              Real-time Sync
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            এখান থেকে নতুন স্লাইড যোগ করুন, হেল্পলাইন নাম্বার পরিবর্তন করুন, টপ নোটিশ বার, ডেলিভারি চার্জ ও ফুটার তথ্য তাৎক্ষণিকভাবে ইউজার প্যানেলে পরিবর্তন করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Reset to initial values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{store.language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin">⏳</span>
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>{saveSuccess ? 'সফলভাবে সংরক্ষিত!' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-1.5 flex flex-wrap gap-1.5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSubTab('slides')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            subTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>🎯 হিরো স্লাইডার ব্যানার ({currentSettings.heroSlides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('helpline')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            subTab === 'helpline' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>📞 হেল্পলাইন ও কন্টাক্ট ইনফো</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('topbar')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            subTab === 'topbar' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>📢 টপ নোটিশ ও অফার বার</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('branding')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            subTab === 'branding' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>🏪 ব্র্যান্ডিং ও ডেলিভারি চার্জ</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('footer')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            subTab === 'footer' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>🌐 ফুটার ও সোশ্যাল লিঙ্কস</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SLIDES MANAGER SUB-TAB                                             */}
      {/* ========================================================================= */}
      {subTab === 'slides' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>হোমপেজ ব্যানার স্লাইড তালিকা</span>
                <span className="text-[11px] bg-slate-950 px-2 py-0.5 rounded text-amber-400 font-mono">
                  {currentSettings.heroSlides.length} টি স্লাইড
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                প্রতিটি স্লাইডের ছবি, শিরোনাম, অফার ডিসকাউন্ট এবং অ্যাকশন বাটন এখান থেকে পরিবর্তন বা নতুন যোগ করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddSlide}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন স্লাইড তৈরি করুন</span>
            </button>
          </div>

          {/* Slides List Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentSettings.heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`bg-slate-800/90 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  slide.isActive !== false ? 'border-slate-700 shadow-md' : 'border-rose-900/50 opacity-60'
                }`}
              >
                {/* Banner Image Preview */}
                <div className="aspect-[16/9] relative bg-slate-950 overflow-hidden group">
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt={slide.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                      No Image Selected
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Badges on preview */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-slate-900/90 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                      #{idx + 1}
                    </span>
                    {slide.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {slide.badge}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSlideActive(slide)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                        slide.isActive !== false
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}
                      title="Toggle active status"
                    >
                      {slide.isActive !== false ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Off)'}
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <p className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase line-clamp-1">
                      {slide.tagBn || slide.tagEn}
                    </p>
                    <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                      {slide.titleBn || slide.titleEn}
                    </h4>
                  </div>
                </div>

                {/* Slide Details */}
                <div className="p-3.5 space-y-2 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                      {slide.descBn || slide.descEn}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60">
                      <span>বাটন: <strong className="text-amber-400">{slide.buttonBn || slide.buttonEn}</strong></span>
                      <span className="font-mono text-[10px] uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                        Target: {slide.actionType}
                      </span>
                    </div>
                  </div>

                  {/* Action Controls (Move Up/Down, Edit, Delete) */}
                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, 'up')}
                        className="p-1.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentSettings.heroSlides.length - 1}
                        onClick={() => handleMoveSlide(idx, 'down')}
                        className="p-1.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSlide(slide)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 rounded-lg transition font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>এডিট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HELPLINE & CONTACTS SUB-TAB                                             */}
      {/* ========================================================================= */}
      {subTab === 'helpline' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-700/80 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>হেল্পলাইন ও কন্টাক্ট ইনফরমেশন পরিবর্তন</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              এখানে হটলাইন ও হেল্পলাইন নাম্বার পরিবর্তন করলে তা ওয়েবসাইটের হেডার, ফুটার এবং কন্টাক্ট পেজে তাৎক্ষণিকভাবে আপডেট হয়ে যাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Helpline / Hotline Number */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>প্রধান হেল্পলাইন / হটলাইন নাম্বার (Hotline Phone):</span>
              </label>
              <input
                type="text"
                value={formState.helplinePhone}
                onChange={e => setFormState({ ...formState, helplinePhone: e.target.value })}
                placeholder="+880 1811-534513"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400">
                হেডারের "Hotline" এবং ফুটারের ফোন লিঙ্কে এই নাম্বারটি সরাসরি দেখানো হবে।
              </span>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="text-emerald-400 text-sm">💬</span>
                <span>হোয়াটসঅ্যাপ সাপোর্ট নাম্বার (WhatsApp Direct):</span>
              </label>
              <input
                type="text"
                value={formState.whatsappNumber}
                onChange={e => setFormState({ ...formState, whatsappNumber: e.target.value })}
                placeholder="+880 1811-534513"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400">
                গ্রাহক ক্লিক করলে সরাসরি আপনার হোয়াটসঅ্যাপে চ্যাট শুরু করতে পারবে।
              </span>
            </div>

            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>অফিশিয়াল সাপোর্ট ইমেইল (Support Email):</span>
              </label>
              <input
                type="email"
                value={formState.supportEmail}
                onChange={e => setFormState({ ...formState, supportEmail: e.target.value })}
                placeholder="support@7x-shop.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            {/* Support Timings */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>কাস্টমার কেয়ার কাজের সময় (Working Hours - Bangla):</span>
              </label>
              <input
                type="text"
                value={formState.workingHoursBn}
                onChange={e => setFormState({ ...formState, workingHoursBn: e.target.value })}
                placeholder="প্রতিদিন: সকাল ৯:০০ - রাত ১১:০০ টা"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            {/* Office Address Bangla */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>কর্পোরেট অফিস ও শোরুম ঠিকানা (Address - Bangla):</span>
              </label>
              <input
                type="text"
                value={formState.officeAddressBn}
                onChange={e => setFormState({ ...formState, officeAddressBn: e.target.value })}
                placeholder="হাউস ৪২, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩, বাংলাদেশ"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            {/* Delivery Timelines */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                ঢাকার ভেতর ডেলিভারি সময় (Inside Dhaka Timeline):
              </label>
              <input
                type="text"
                value={formState.insideDhakaDeliveryTime}
                onChange={e => setFormState({ ...formState, insideDhakaDeliveryTime: e.target.value })}
                placeholder="24 Hours"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                ঢাকার বাইরে ডেলিভারি সময় (Outside Dhaka Timeline):
              </label>
              <input
                type="text"
                value={formState.outsideDhakaDeliveryTime}
                onChange={e => setFormState({ ...formState, outsideDhakaDeliveryTime: e.target.value })}
                placeholder="48-72 Hours"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>হেল্পলাইন ও কন্টাক্ট সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TOP ANNOUNCEMENT BAR SUB-TAB                                            */}
      {/* ========================================================================= */}
      {subTab === 'topbar' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-700/80 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>টপ বার অফার নোটিশ ও এনাউন্সমেন্ট বার</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ওয়েবসাইটের একদম উপরে যে কালো অফার ব্যানারটি থাকে, সেটির লেখা ও অন/অফ নিয়ন্ত্রণ করুন।
              </p>
            </div>

            {/* Toggle switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {formState.showTopBar ? 'দৃশ্যমান (Visible)' : 'লুকানো (Hidden)'}
              </span>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, showTopBar: !formState.showTopBar })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formState.showTopBar ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    formState.showTopBar ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">লাইভ প্রিভিউ (Live Preview):</span>
            <div className="bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-xs text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">
                {store.language === 'bn' ? formState.topBarAnnouncementBn : formState.topBarAnnouncementEn}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                বাংলা নোটিশ বার্তা (Bangla Announcement):
              </label>
              <textarea
                rows={3}
                value={formState.topBarAnnouncementBn}
                onChange={e => setFormState({ ...formState, topBarAnnouncementBn: e.target.value })}
                placeholder="⚡ হট অফার: সারা বাংলাদেশে ক্যাশ অন ডেলিভারি এবং ২,০০০ টাকার অর্ডারে ফ্রি শিপিং!"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                ইংরেজি নোটিশ বার্তা (English Announcement):
              </label>
              <textarea
                rows={3}
                value={formState.topBarAnnouncementEn}
                onChange={e => setFormState({ ...formState, topBarAnnouncementEn: e.target.value })}
                placeholder="⚡ FREE Express Doorstep Delivery on orders above ৳2,000 across all 64 districts!"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-slate-300 font-semibold">
                ফ্রি ডেলিভারির সর্বনিম্ন কেনাকাটার সীমা (Free Shipping Threshold Amount - ৳):
              </label>
              <div className="max-w-xs">
                <input
                  type="number"
                  value={formState.freeDeliveryThreshold}
                  onChange={e => setFormState({ ...formState, freeDeliveryThreshold: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                এই পরিমাণের বেশি অর্ডারে গ্রাহক স্বয়ংক্রিয়ভাবে ০ টাকা ডেলিভারি চার্জ পাবেন।
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>টপ বার সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BRANDING & DELIVERY FEES SUB-TAB                                        */}
      {/* ========================================================================= */}
      {subTab === 'branding' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-700/80 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>স্টোর ব্র্যান্ডিং ও ডেলিভারি চার্জ কনফিগারেশন</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              দোকানের নাম, লোগোর সংক্ষিপ্ত নাম এবং ঢাকা ও ঢাকার বাইরের ডেলিভারি চার্জ নির্ধারণ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">দোকানের পুরো নাম (Store Name):</label>
              <input
                type="text"
                value={formState.storeName}
                onChange={e => setFormState({ ...formState, storeName: e.target.value })}
                placeholder="7X_SHOP.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-amber-500"
              />
            </div>

            {/* Logo Badge Text */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">লোগো ব্যাজ টেক্সট (Short Logo Text):</label>
              <input
                type="text"
                maxLength={4}
                value={formState.logoText}
                onChange={e => setFormState({ ...formState, logoText: e.target.value })}
                placeholder="7X"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-black tracking-wider outline-none focus:border-amber-500"
              />
            </div>

            {/* Tagline Bn */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">ট্যাগলাইন (Bangla):</label>
              <input
                type="text"
                value={formState.taglineBn}
                onChange={e => setFormState({ ...formState, taglineBn: e.target.value })}
                placeholder="অনলাইন মার্কেটপ্লেস"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            {/* Tagline En */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">ট্যাগলাইন (English):</label>
              <input
                type="text"
                value={formState.taglineEn}
                onChange={e => setFormState({ ...formState, taglineEn: e.target.value })}
                placeholder="Modern Bangladesh Online Marketplace"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            {/* Inside Dhaka Delivery Fee */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                ঢাকার ভেতর ডেলিভারি ফি (Inside Dhaka Shipping Fee - ৳):
              </label>
              <input
                type="number"
                value={formState.insideDhakaDeliveryFee}
                onChange={e => setFormState({ ...formState, insideDhakaDeliveryFee: Number(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            {/* Outside Dhaka Delivery Fee */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                ঢাকার বাইরে ডেলিভারি ফি (Outside Dhaka Shipping Fee - ৳):
              </label>
              <input
                type="number"
                value={formState.outsideDhakaDeliveryFee}
                onChange={e => setFormState({ ...formState, outsideDhakaDeliveryFee: Number(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ব্র্যান্ডিং সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FOOTER & SOCIAL MEDIA SUB-TAB                                           */}
      {/* ========================================================================= */}
      {subTab === 'footer' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-700/80 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>ফুটার ও সোশ্যাল মিডিয়া লিঙ্কস পরিবর্তন</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ফুটারের পরিচিতি বিবরণ, কপিরাইট বার্তা এবং সামাজিক যোগাযোগ মাধ্যমের পেজ লিঙ্ক নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-slate-300 font-semibold">ফুটার বিবরণ (Footer Bio - Bangla):</label>
              <textarea
                rows={2}
                value={formState.footerBioBn}
                onChange={e => setFormState({ ...formState, footerBioBn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-slate-300 font-semibold">কপিরাইট টেক্সট (Copyright Notice):</label>
              <input
                type="text"
                value={formState.copyrightText}
                onChange={e => setFormState({ ...formState, copyrightText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">ফেসবুক পেজ লিঙ্ক (Facebook URL):</label>
              <input
                type="url"
                value={formState.facebookUrl}
                onChange={e => setFormState({ ...formState, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">টেলিগ্রাম চ্যানেল / গ্রুপ লিঙ্ক (Telegram URL):</label>
              <input
                type="url"
                value={formState.telegramChannelUrl}
                onChange={e => setFormState({ ...formState, telegramChannelUrl: e.target.value })}
                placeholder="https://t.me/yourchannel"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">ইউটিউব চ্যানেল লিঙ্ক (YouTube URL):</label>
              <input
                type="url"
                value={formState.youtubeUrl}
                onChange={e => setFormState({ ...formState, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">ইনস্টাগ্রাম প্রোফাইল লিঙ্ক (Instagram URL):</label>
              <input
                type="url"
                value={formState.instagramUrl}
                onChange={e => setFormState({ ...formState, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ফুটার ও লিঙ্ক সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE ADD / EDIT MODAL                                                    */}
      {/* ========================================================================= */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{editingSlideId ? 'ব্যানার স্লাইড এডিট করুন' : 'নতুন ব্যানার স্লাইড তৈরি করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
              {/* Image Preview & Picker */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">ব্যানার ছবি নির্বাচন করুন (Banner Image): *</label>
                
                {/* Active chosen image preview */}
                <div className="aspect-[16/8] relative bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
                  {slideForm.image ? (
                    <img
                      src={slideForm.image}
                      alt="Slide Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      ব্যানার ছবি নির্বাচন করুন
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[10px] text-amber-300 font-mono">
                      Current Banner Preview
                    </span>
                  </div>
                </div>

                {/* Image Picker Tabs */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setImagePickerTab('preset')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        imagePickerTab === 'preset' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      প্রিসেট হাই-রেজ ছবি (1-Click)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePickerTab('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        imagePickerTab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ডিভাইস থেকে আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePickerTab('url')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        imagePickerTab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ওয়েব লিঙ্ক (URL)
                    </button>
                  </div>

                  {/* 1. Presets */}
                  {imagePickerTab === 'preset' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {PRESET_HERO_BANNERS.map(preset => (
                        <div
                          key={preset.id}
                          onClick={() => setSlideForm({ ...slideForm, image: preset.url })}
                          className={`aspect-[16/9] rounded-lg overflow-hidden relative cursor-pointer border-2 transition-all group ${
                            slideForm.image === preset.url ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {preset.url ? (
                            <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          ) : null}
                          <div className="absolute inset-0 bg-slate-950/40 p-1 flex items-end">
                            <span className="text-[9px] text-white font-bold line-clamp-1">{preset.category}</span>
                          </div>
                          {slideForm.image === preset.url && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Device Upload */}
                  {imagePickerTab === 'upload' && (
                    <div className="p-4 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl text-center space-y-2 transition">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-200">
                        আপনার কম্পিউটার বা মোবাইল থেকে ব্যানার ছবি সিলেক্ট করুন
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg text-xs transition"
                      >
                        ফাইল ব্রাউজ করুন (Browse)
                      </button>
                    </div>
                  )}

                  {/* 3. URL Link */}
                  {imagePickerTab === 'url' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={customBannerUrl}
                        onChange={e => setCustomBannerUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customBannerUrl.trim()) {
                            setSlideForm({ ...slideForm, image: customBannerUrl.trim() });
                            setCustomBannerUrl('');
                            store.showToast('ছবি সেট হয়েছে', 'লিঙ্ক থেকে ছবি নির্বাচিত হয়েছে।', 'success');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        সেট করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    স্লাইড শিরোনাম (Bangla Title): *
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.titleBn}
                    onChange={e => setSlideForm({ ...slideForm, titleBn: e.target.value })}
                    placeholder="নতুন প্রজন্মের স্মার্টওয়াচ ও প্রিমিয়াম অডিও"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    স্লাইড শিরোনাম (English Title): *
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.titleEn}
                    onChange={e => setSlideForm({ ...slideForm, titleEn: e.target.value })}
                    placeholder="Next-Gen Smartwatches & Audio Gear"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ট্যাগলাইন / সুপার-টাইটেল (Bangla Tag):
                  </label>
                  <input
                    type="text"
                    value={slideForm.tagBn}
                    onChange={e => setSlideForm({ ...slideForm, tagBn: e.target.value })}
                    placeholder="উইকেন্ড মেগা ফ্ল্যাশ সেল"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    অফার ব্যাজ (Offer Badge):
                  </label>
                  <input
                    type="text"
                    value={slideForm.badge}
                    onChange={e => setSlideForm({ ...slideForm, badge: e.target.value })}
                    placeholder="Up to 35% OFF"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    বিস্তারিত বিবরণ (Bangla Description):
                  </label>
                  <textarea
                    rows={2}
                    value={slideForm.descBn}
                    onChange={e => setSlideForm({ ...slideForm, descBn: e.target.value })}
                    placeholder="৩৫% পর্যন্ত বিশেষ ছাড়, সারা দেশে হোম ডেলিভারি এবং ১ বছরের অফিশিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি।"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    বাটন টেক্সট (Button Text - Bangla):
                  </label>
                  <input
                    type="text"
                    value={slideForm.buttonBn}
                    onChange={e => setSlideForm({ ...slideForm, buttonBn: e.target.value })}
                    placeholder="অফারগুলো দেখুন"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ক্লিক করলে কোথায় যাবে (Action Target):
                  </label>
                  <select
                    value={slideForm.actionType}
                    onChange={e => setSlideForm({ ...slideForm, actionType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    <option value="deals">হট ডিলস পেজ (Flash Deals)</option>
                    <option value="shop">সকল পণ্য ক্যাটালগ (Shop All)</option>
                    <option value="url">কাস্টম ওয়েব লিংক (External / Custom URL)</option>
                  </select>
                </div>

                {slideForm.actionType === 'url' && (
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">
                      কাস্টম লিঙ্ক ইউআরএল (Custom Action URL):
                    </label>
                    <input
                      type="url"
                      value={slideForm.actionUrl}
                      onChange={e => setSlideForm({ ...slideForm, actionUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">স্লাইডটি সরাসরি সক্রিয় থাকবে?</span>
                  <span className="text-[11px] text-slate-400">অন থাকলে হোমপেজে তাৎক্ষণিকভাবে প্রদর্শিত হবে।</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSlideForm({ ...slideForm, isActive: !slideForm.isActive })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    slideForm.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      slideForm.isActive ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingSlideId ? 'স্লাইড আপডেট করুন' : 'স্লাইড যোগ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
