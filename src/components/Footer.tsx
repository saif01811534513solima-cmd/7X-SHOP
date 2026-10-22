import React from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Banknote, 
  RotateCcw,
  Send,
  Heart
} from 'lucide-react';
import { useShopStore } from '../services/store';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const store = useShopStore();
  const t = store.t();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-extrabold text-base">
                {store.siteSettings?.logoText || '7X'}
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                {store.siteSettings?.storeName || '7X_SHOP.com'}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {store.language === 'bn' 
                ? (store.siteSettings?.footerBioBn || 'বাংলাদেশের নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। শতভাগ আসল প্রযুক্তি পণ্য, লাইফস্টাইল গ্যাজেট এবং সারাদেশে ক্যাশ অন ডেলিভারি।')
                : (store.siteSettings?.footerBioEn || 'Next-generation modern online marketplace delivering 100% genuine tech gadgets, smart wearables, and lifestyle gear with Cash on Delivery nationwide.')}
            </p>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {store.language === 'bn'
                    ? (store.siteSettings?.officeAddressBn || t.dhakaOffice)
                    : (store.siteSettings?.officeAddressEn || t.dhakaOffice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <a 
                  href={`tel:${store.siteSettings?.helplinePhone || '+8801811534513'}`}
                  className="font-mono hover:text-amber-400 transition"
                >
                  {store.siteSettings?.helplinePhone || t.supportHotline}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <a 
                  href={`mailto:${store.siteSettings?.supportEmail || 'support@7x-shop.com'}`}
                  className="hover:text-amber-400 transition"
                >
                  {store.siteSettings?.supportEmail || 'support@7x-shop.com'}
                </a>
              </div>
            </div>
          </div>


          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {t.categories}
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition">
                  Smart Gadgets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition">
                  Headphones & Audio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition">
                  Tech Accessories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition">
                  Watches & Wearables
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition">
                  Gaming Gear
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition">
                  {t.contactUs}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-amber-400 transition">
                  {t.privacyPolicy}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-amber-400 transition">
                  {t.termsConditions}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('deals')} className="hover:text-amber-400 transition">
                  {t.deals}
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Accepted Payments
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-white font-bold block">💵 Cash on Delivery</span>
                <span>Inspect your parcel before paying the courier rider.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-white font-bold block">📱 bKash / Nagad / Upay</span>
                <span>Fast digital confirmation via Mobile Banking.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>{store.siteSettings?.copyrightText || `© ${new Date().getFullYear()} ${store.siteSettings?.storeName || '7X_SHOP.com'}. ${t.allRightsReserved}`}</p>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            {store.siteSettings?.whatsappNumber && (
              <a 
                href={`https://wa.me/${store.siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <span>WhatsApp: {store.siteSettings.whatsappNumber}</span>
              </a>
            )}
            <button onClick={() => onNavigate('privacy')} className="hover:underline">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:underline">Terms</button>
            <button onClick={() => onNavigate('contact')} className="hover:underline">Contact</button>
            <span className="text-emerald-500 font-mono">Telegram Alerts: Connected</span>
          </div>
        </div>
      </div>
    </footer>

  );
};
