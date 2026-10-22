import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  HelpCircle,
  Send
} from 'lucide-react';
import { useShopStore } from '../services/store';

interface StaticPagesProps {
  page: 'contact' | 'privacy' | 'terms';
  onNavigate: (page: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onNavigate }) => {
  const store = useShopStore();
  const t = store.t();

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setContactName('');
      setContactPhone('');
      setContactMessage('');
    }, 4000);
  };

  if (page === 'contact') {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.contactUs}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Have questions about an order or delivery? Our Dhaka support team is available 24/7 to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Office Details */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Corporate Headquarters
            </h2>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Banani Office:</strong>
                  <span>
                    {store.language === 'bn' 
                      ? (store.siteSettings?.officeAddressBn || t.dhakaOffice)
                      : (store.siteSettings?.officeAddressEn || t.dhakaOffice)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Direct Customer Hotline & Helpline:</strong>
                  <span className="font-mono text-slate-800 font-bold">{store.siteSettings?.helplinePhone || t.supportHotline}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {store.language === 'bn'
                      ? (store.siteSettings?.workingHoursBn || 'প্রতিদিন: সকাল ৯:০০ - রাত ১১:০০ টা')
                      : (store.siteSettings?.workingHoursEn || 'Everyday: 9:00 AM - 11:00 PM')}
                  </p>
                </div>
              </div>

              {store.siteSettings?.whatsappNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 text-emerald-600 font-bold shrink-0 mt-0.5 text-xs">💬</div>
                  <div>
                    <strong className="block text-slate-900">WhatsApp Support:</strong>
                    <a 
                      href={`https://wa.me/${store.siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-mono text-emerald-600 hover:underline font-bold"
                    >
                      {store.siteSettings.whatsappNumber}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Customer Support Email:</strong>
                  <span className="font-mono text-slate-800">{store.siteSettings?.supportEmail || 'support@7x-shop.com'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Delivery Timelines:</strong>
                  <span>
                    Inside Dhaka: {store.siteSettings?.insideDhakaDeliveryTime || '24 Hours'} · Outside Dhaka: {store.siteSettings?.outsideDhakaDeliveryTime || '48-72 Hours'}
                  </span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-slate-700 space-y-1">
              <strong className="text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Cash on Delivery Guarantee</span>
              </strong>
              <p className="text-[11px] text-slate-600">
                You only pay when the rider arrives with your parcel and you inspect the package seal.
              </p>
            </div>
          </div>

          {/* Direct Inquiry Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Send us a Message
            </h2>

            {sentSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 text-emerald-800">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm">Message Sent Successfully!</h3>
                <p className="text-xs text-emerald-700">
                  Thank you! Our representative will call or reply to your inquiry shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.fullName} *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.phone} *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Message or Order Inquiry *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder="Tell us what you need help with..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs my-6 p-6 sm:p-10 space-y-6 text-xs text-slate-700 leading-relaxed">
        <h1 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">
          Privacy Policy - 7X_SHOP.com
        </h1>
        <p>
          At <strong>7X_SHOP.com</strong>, we are committed to safeguarding your personal data and ensuring that your shopping experience is completely safe and transparent.
        </p>

        <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
        <p>
          When you place an order on 7X_SHOP, we collect your name, contact phone number, delivery address, and optionally email address to fulfill delivery and notify you about order progress.
        </p>

        <h3 className="text-sm font-bold text-slate-900">2. Real-Time Order Notifications</h3>
        <p>
          For rapid courier dispatch and customer fulfillment, our automated dispatch system sends immediate notifications to our admin dispatch terminal and secure Telegram bot alerts.
        </p>

        <h3 className="text-sm font-bold text-slate-900">3. Cash on Delivery Safety</h3>
        <p>
          We never store full debit or credit card credentials on our servers. For Cash on Delivery, payment is handled strictly in person with authorized delivery courier personnel.
        </p>
      </div>
    );
  }

  // Terms and conditions
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs my-6 p-6 sm:p-10 space-y-6 text-xs text-slate-700 leading-relaxed">
      <h1 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">
        Terms & Conditions - 7X_SHOP.com
      </h1>
      <p>
        Welcome to 7X_SHOP.com. By browsing our marketplace and placing orders, you agree to the following terms and guidelines.
      </p>

      <h3 className="text-sm font-bold text-slate-900">1. Nationwide Doorstep Delivery</h3>
      <p>
        We deliver across all 64 districts in Bangladesh. Standard delivery inside Dhaka is 24 hours and outside Dhaka is 48 to 72 hours.
      </p>

      <h3 className="text-sm font-bold text-slate-900">2. 7-Day Replacement Policy</h3>
      <p>
        If any product has a manufacturing defect or does not match specifications, customers are entitled to a replacement within 7 days of package delivery.
      </p>

      <h3 className="text-sm font-bold text-slate-900">3. Order Verification</h3>
      <p>
        Prior to dispatching high-value items, our verification desk may place a brief phone call to confirm delivery address availability.
      </p>
    </div>
  );
};
