import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Check, 
  AlertCircle,
  Lock,
  ArrowRight,
  Copy,
  Info,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useShopStore, defaultPaymentSettings } from '../services/store';
import { BANGLADESH_DISTRICTS } from '../data/mockData';
import { Order, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

// Brand SVG Badges
export const BkashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#E2136E"/>
    <path d="M11 29L29 20L22 13L11 29Z" fill="white"/>
    <path d="M29 20L20 7L22 13L29 20Z" fill="#FCE4EC"/>
    <path d="M11 29L19 21L22 13L11 29Z" fill="#F8BBD0"/>
  </svg>
);

export const NagadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#F7941D"/>
    <path d="M13 27C13 27 16 30 22 28C28 26 29 19 26 14C23 10 20 9 20 9C20 9 21 14 19 17C17 20 13 20 13 27Z" fill="#ED1C24"/>
    <path d="M17 25C17 25 19 27 22 26C25 25 26 21 24 18C22 15 21 14 21 14C21 14 22 17 20 19C18 21 17 21 17 25Z" fill="white"/>
  </svg>
);

export const RocketIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#8C3494"/>
    <path d="M20 8L26 18L20 22L14 18L20 8Z" fill="white"/>
    <path d="M14 18L9 25L16 23.5L14 18Z" fill="#E1BEE7"/>
    <path d="M26 18L31 25L24 23.5L26 18Z" fill="#E1BEE7"/>
    <path d="M17 24.5L20 32L23 24.5L20 22L17 24.5Z" fill="#FFD54F"/>
  </svg>
);

export const VisaIcon = ({ className = "w-6 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#0A2540"/>
    <path d="M14.2 16.5L16.4 7.5H18.7L16.5 16.5H14.2ZM24.4 7.7C23.9 7.5 23.1 7.3 22.2 7.3C19.7 7.3 18 8.6 18 10.5C18 11.9 19.3 12.6 20.2 13.1C21.2 13.6 21.6 13.9 21.6 14.4C21.6 15.1 20.7 15.4 19.9 15.4C18.8 15.4 18.2 15.2 17.4 14.8L17 14.6L16.6 16.5C17.2 16.8 18.4 17 19.6 17C22.3 17 24 15.7 24 13.7C24 12.2 22.9 11.4 21.7 10.8C20.9 10.4 20.4 10.1 20.4 9.6C20.4 9.1 21 8.7 22.1 8.7C22.9 8.7 23.6 8.9 24 9.1L24.4 7.7ZM29 7.5H27.1C26.5 7.5 26 7.7 25.8 8.3L22.2 16.5H24.6L25.1 15.2H28.1L28.4 16.5H30.6L29 7.5ZM25.7 13.5L27 9.8L27.7 13.5H25.7ZM12.7 7.5L10.5 13.6L10.2 12.3C9.8 11 8.7 9.6 7.4 8.9L9.6 16.5H12.1L15.8 7.5H12.7Z" fill="white"/>
    <path d="M9 7.5H5.4L5.3 7.7C8.1 8.4 10.1 10.2 10.8 12.3L10 8.3C9.8 7.7 9.4 7.5 9 7.5Z" fill="#F7B600"/>
  </svg>
);

export const MastercardIcon = ({ className = "w-6 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#141414"/>
    <circle cx="13" cy="12" r="7" fill="#EB001B"/>
    <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
    <path d="M18 7C19.4 8.4 20.2 10.1 20.2 12C20.2 13.9 19.4 15.6 18 17C16.6 15.6 15.8 13.9 15.8 12C15.8 10.1 16.6 8.4 18 7Z" fill="#FF5F00"/>
  </svg>
);

export const AmexIcon = ({ className = "w-6 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#006FCF"/>
    <text x="18" y="15" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">AMEX</text>
  </svg>
);

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const store = useShopStore();
  const t = store.t();

  // Customer Details Form State
  const [customerName, setCustomerName] = useState(store.currentUser?.name || '');
  const [phone, setPhone] = useState(store.currentUser?.phone || '');
  const [email, setEmail] = useState(store.currentUser?.email || '');
  const [district, setDistrict] = useState(store.currentUser?.district || 'Dhaka');
  const [address, setAddress] = useState(store.currentUser?.address || '');
  const [notes, setNotes] = useState('');

  // Payment Selection State
  // Types: 'cod' (Cash on Delivery) | 'mfs' (bKash/Nagad/Rocket) | 'card'
  const [paymentType, setPaymentType] = useState<'cod' | 'mfs' | 'card'>('cod');
  
  // Mobile Banking State
  const [selectedMfs, setSelectedMfs] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState(store.currentUser?.phone || '');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Debit/Credit Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(store.currentUser?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = store.getCartSubtotal();
  const discount = store.getCartDiscount(subtotal);
  const deliveryFee = store.getCartDeliveryFee(subtotal);
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const paymentSettings = store.paymentSettings || defaultPaymentSettings;
  const currentMfsConfig = paymentSettings ? paymentSettings[selectedMfs] : null;
  const merchantNumber = currentMfsConfig?.number || '01811-534513';
  const accountType = currentMfsConfig?.accountType || 'Personal';

  // Detect card network
  const getCardNetwork = (num: string): 'visa' | 'mastercard' | 'amex' | 'generic' => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'generic';
  };

  const cardNetwork = getCardNetwork(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLen = cardNetwork === 'amex' ? 4 : 3;
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setCardCvv(raw);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('01811534513');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2200);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(store.language === 'bn' ? 'দয়া করে আপনার সম্পূর্ণ নাম লিখুন' : 'Please provide your full name');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage(
        store.language === 'bn' 
          ? 'সঠিক মোবাইল নম্বর লিখুন (যেমন: 01712345678)' 
          : 'Please enter a valid phone number (e.g. 01712345678)'
      );
      return;
    }

    if (!address.trim()) {
      setErrorMessage(store.language === 'bn' ? 'দয়া করে আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন' : 'Please enter your full delivery address');
      return;
    }

    if (store.cart.length === 0) {
      setErrorMessage('Your cart is empty. Add products first.');
      return;
    }

    // Validate Mobile Banking
    if (paymentType === 'mfs') {
      if (!trxId.trim()) {
        setErrorMessage(
          store.language === 'bn' 
            ? 'পেমেন্ট সম্পন্ন করে অনুগ্রহ করে ট্রানজেকশন আইডি (Transaction ID / TrxID) প্রদান করুন।' 
            : 'Please complete payment and enter your Transaction ID (TrxID) below.'
        );
        return;
      }
      if (!senderNumber.trim() || senderNumber.trim().length < 10) {
        setErrorMessage(
          store.language === 'bn'
            ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন সেই মোবাইল নম্বরটি লিখুন।'
            : 'Please provide the sender mobile number used for payment.'
        );
        return;
      }
    }

    // Priority 4: Block raw card payments until certified gateway is live
    if (paymentType === 'card') {
      setErrorMessage(
        store.language === 'bn'
          ? 'কার্ড পেমেন্ট গেটওয়ে ইন্টিগ্রেশন চলমান রয়েছে। অর্ডার নিশ্চিত করতে অনুগ্রহ করে ক্যাশ অন ডেলিভারি অথবা বিকাশ / নগদ / রকেট নির্বাচন করুন।'
          : 'Card gateway integration is in progress. Please choose Cash on Delivery or Mobile Banking (bKash/Nagad/Rocket).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const finalPaymentMethod: PaymentMethod = 
        paymentType === 'cod' ? 'cod' : selectedMfs;

      const orderTrxId = 
        paymentType === 'mfs' 
          ? trxId.trim().toUpperCase() 
          : undefined;

      const order = await store.placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        district,
        address: address.trim(),
        notes: notes.trim(),
        paymentMethod: finalPaymentMethod,
        trxId: orderTrxId,
        senderNumber: paymentType === 'mfs' ? senderNumber.trim() : undefined,
        mfsProvider: paymentType === 'mfs' ? selectedMfs : undefined,
      });

      setIsSubmitting(false);
      onClose();
      onOrderPlaced(order);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              {store.language === 'bn' ? 'নিরাপদ চেকআউট ও অর্ডার কনফার্মেশন' : 'Secure Checkout & Order Confirmation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delivery Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>{t.shippingDetails}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com (optional)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.district} *
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
                >
                  {BANGLADESH_DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fullAddress} *
                </label>
                <textarea
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House number, Road / Sector, Flat No., Thana, District"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.orderNotes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special instructions e.g. Call before delivery, ring twice..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* VISUAL PAYMENT METHODS SECTION */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>{store.language === 'bn' ? 'পেমেন্ট মাধ্যম (Payment Methods)' : 'Accepted Payment Methods'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure Checkout</span>
              </span>
            </div>

            {/* Visual Accepted Brands Badges Strip */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-[11px] font-medium text-slate-600">
                {store.language === 'bn' ? 'গৃহীত কার্ড, মোবাইল ব্যাংকিং ও ক্যাশ:' : 'Accepted Cards, Banking & COD:'}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visa Badge */}
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <VisaIcon className="w-5 h-3.5" />
                  <span className="text-[10px] font-bold text-[#0A2540]">Visa</span>
                </div>

                {/* Mastercard Badge */}
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <MastercardIcon className="w-5 h-3.5" />
                  <span className="text-[10px] font-bold text-slate-800">Mastercard</span>
                </div>

                {/* Amex Badge */}
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <AmexIcon className="w-5 h-3.5" />
                  <span className="text-[10px] font-bold text-[#006FCF]">Amex</span>
                </div>

                {/* bKash Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-pink-200 shadow-2xs">
                  <BkashIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-[#D12053]">bKash</span>
                </div>

                {/* Nagad Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-orange-200 shadow-2xs">
                  <NagadIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-[#ED1C24]">Nagad</span>
                </div>

                {/* Rocket Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-purple-200 shadow-2xs">
                  <RocketIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-[#8C3494]">Rocket</span>
                </div>

                {/* COD Badge */}
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-emerald-200 shadow-2xs text-[10px] font-bold text-emerald-700">
                  <span>💵</span>
                  <span>COD</span>
                </div>
              </div>
            </div>

            {/* Primary Payment Mode Radio Selector */}
            <div className="space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                paymentType === 'cod' 
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/30' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === 'cod'}
                  onChange={() => setPaymentType('cod')}
                  className="mt-0.5 text-amber-500 focus:ring-amber-400"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>💵</span>
                      <span>{t.payCod}</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {store.language === 'bn' ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {store.language === 'bn' 
                      ? 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করুন।' 
                      : 'Pay with cash upon physical doorstep parcel inspection.'}
                  </p>
                </div>
              </label>

              {/* Option 2: Mobile Banking (bKash, Nagad, Rocket) */}
              <div className={`rounded-xl border transition overflow-hidden ${
                paymentType === 'mfs' 
                  ? 'border-amber-500 bg-white ring-1 ring-amber-500/30 shadow-xs' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <label className="flex items-start gap-3 p-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'mfs'}
                    onChange={() => setPaymentType('mfs')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-pink-600" />
                        <span>{store.language === 'bn' ? 'মোবাইল ব্যাংকিং (বিকাশ / নগদ / রকেট)' : 'Mobile Banking (bKash / Nagad / Rocket)'}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <BkashIcon className="w-4 h-4" />
                        <NagadIcon className="w-4 h-4" />
                        <RocketIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {store.language === 'bn'
                        ? 'বিকাশ, নগদ বা রকেট অ্যাপ দিয়ে পেমেন্ট করে তাৎক্ষণিক কনফার্মেশন নিন।'
                        : 'Pay instantly via bKash, Nagad, or Rocket and enter your Transaction ID (TrxID).'}
                    </p>
                  </div>
                </label>

                {/* Expanded Mobile Banking Payment Panel */}
                {paymentType === 'mfs' && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50/70 border-t border-slate-200/80 space-y-4 animate-in fade-in duration-200">
                    {/* Provider Select Tabs */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 mb-2">
                        {store.language === 'bn' ? 'আপনার পেমেন্ট মাধ্যম বেছে নিন:' : 'Select Your Mobile Banking Provider:'}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {/* bKash Chip */}
                        {paymentSettings.bkash.enabled && (
                          <button
                            type="button"
                            onClick={() => setSelectedMfs('bkash')}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                              selectedMfs === 'bkash'
                                ? 'bg-pink-50 border-[#E2136E] text-[#E2136E] font-bold shadow-2xs ring-1 ring-[#E2136E]/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-pink-300'
                            }`}
                          >
                            <BkashIcon className="w-6 h-6" />
                            <span className="text-xs font-extrabold">bKash</span>
                            <span className="text-[10px] text-slate-500 -mt-1 font-normal">বিকাশ</span>
                          </button>
                        )}

                        {/* Nagad Chip */}
                        {paymentSettings.nagad.enabled && (
                          <button
                            type="button"
                            onClick={() => setSelectedMfs('nagad')}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                              selectedMfs === 'nagad'
                                ? 'bg-orange-50 border-[#ED1C24] text-[#ED1C24] font-bold shadow-2xs ring-1 ring-[#ED1C24]/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                            }`}
                          >
                            <NagadIcon className="w-6 h-6" />
                            <span className="text-xs font-extrabold">Nagad</span>
                            <span className="text-[10px] text-slate-500 -mt-1 font-normal">নগদ</span>
                          </button>
                        )}

                        {/* Rocket Chip */}
                        {paymentSettings.rocket.enabled && (
                          <button
                            type="button"
                            onClick={() => setSelectedMfs('rocket')}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                              selectedMfs === 'rocket'
                                ? 'bg-purple-50 border-[#8C3494] text-[#8C3494] font-bold shadow-2xs ring-1 ring-[#8C3494]/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                            }`}
                          >
                            <RocketIcon className="w-6 h-6" />
                            <span className="text-xs font-extrabold">Rocket</span>
                            <span className="text-[10px] text-slate-500 -mt-1 font-normal">রকেট</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Official Merchant / Account Number Card */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            {selectedMfs.toUpperCase()} {store.language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'} ({accountType} / {accountType === 'Merchant' ? (store.language === 'bn' ? 'পেমেন্ট' : 'Payment') : (store.language === 'bn' ? 'সেন্ড মানি' : 'Send Money')})
                          </span>
                          <span className="text-base font-black font-mono tracking-wider text-slate-900">
                            {merchantNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyNumber}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                              copiedNumber 
                                ? 'bg-emerald-600 text-white shadow-2xs' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {copiedNumber ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{store.language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>{store.language === 'bn' ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500">
                          {store.language === 'bn' ? 'পরিশোধযোগ্য মোট টাকা:' : 'Total Amount to Send:'}
                        </span>
                        <span className="font-extrabold text-amber-600 font-mono text-sm">
                          {store.formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Payment Instructions */}
                    <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl text-xs space-y-1.5 text-slate-800">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {store.language === 'bn' 
                            ? `${selectedMfs.toUpperCase()} দিয়ে পেমেন্ট করার নিয়মাবলী:` 
                            : `How to Pay via ${selectedMfs.toUpperCase()}:`}
                        </span>
                      </div>

                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 pl-0.5 leading-relaxed">
                        <li>
                          {store.language === 'bn'
                            ? `আপনার ${selectedMfs.toUpperCase()} অ্যাপে গিয়ে "Send Money" নির্বাচন করুন।`
                            : `Open your ${selectedMfs.toUpperCase()} app and tap "Send Money" (or Payment).`}
                        </li>
                        <li>
                          {store.language === 'bn'
                            ? `আমাদের নম্বর ${merchantNumber}-এ নির্ধারিত ৳${total.toLocaleString()} টাকা পাঠান।`
                            : `Send exactly ৳${total.toLocaleString()} to our number: ${merchantNumber}`}
                        </li>
                        <li>
                          {store.language === 'bn'
                            ? `পেমেন্ট সম্পন্ন হওয়ার পর পাওয়া ৮-১০ অক্ষরের ট্রানজেকশন আইডি (TrxID) নিচের বক্সে লিখে দিন।`
                            : `Copy the 8-10 character Transaction ID (TrxID) from your confirmation SMS/app and paste below.`}
                        </li>
                      </ol>
                    </div>

                    {/* Inputs for Transaction ID and Sender Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          {store.language === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন *' : 'Sender Mobile Number *'}
                        </label>
                        <input
                          type="tel"
                          required={paymentType === 'mfs'}
                          value={senderNumber}
                          onChange={e => setSenderNumber(e.target.value)}
                          placeholder="018XXXXXXXX"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-amber-500 outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {store.language === 'bn' ? 'ভেরিফিকেশনের জন্য প্রযোজ্য' : 'Used to verify incoming payment'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                          <span>{store.language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold uppercase">Required</span>
                        </label>
                        <input
                          type="text"
                          required={paymentType === 'mfs'}
                          value={trxId}
                          onChange={e => setTrxId(e.target.value.toUpperCase())}
                          placeholder="e.g. 9K8B2L7X"
                          className="w-full bg-white border-2 border-amber-400 focus:border-amber-600 rounded-lg px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase text-slate-900 outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          {store.language === 'bn' 
                            ? 'পেমেন্টের পর মেসেজে পাওয়া TrxID কোডটি লিখুন' 
                            : 'Enter the TrxID code received after successful payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: Visual Debit / Credit Card Section (Priority 4: Compliance notice) */}
              <div className={`rounded-xl border transition overflow-hidden ${
                paymentType === 'card' 
                  ? 'border-amber-500 bg-white ring-1 ring-amber-500/30 shadow-xs' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <label className="flex items-start gap-3 p-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'card'}
                    onChange={() => setPaymentType('card')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>{store.language === 'bn' ? 'ডেবিট / ক্রেডিট কার্ড (Visa, Mastercard, Amex)' : 'Debit / Credit Card (Visa, Mastercard, Amex)'}</span>
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        {store.language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {store.language === 'bn'
                        ? 'ভিসা, মাস্টারকার্ড ও অ্যামেক্স কার্ড গেটওয়ে ইন্টিগ্রেশন চলমান রয়েছে।'
                        : 'Certified 3D Secure 2.0 card payment gateway integration is currently in progress.'}
                    </p>
                  </div>
                </label>

                {/* Expanded Card Compliance & Guidance Panel */}
                {paymentType === 'card' && (
                  <div className="px-4 pb-4 pt-1 bg-amber-50/60 border-t border-amber-200/80 space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 bg-white border border-amber-300/80 rounded-xl space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {store.language === 'bn' 
                            ? 'কার্ড পেমেন্ট গেটওয়ে ইন্টিগ্রেশন চলমান (Under Gateway Integration)' 
                            : 'Certified 3D Secure Card Gateway Under Integration'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {store.language === 'bn'
                          ? 'গ্রাহকদের আর্থিক তথ্যের সর্বোচ্চ নিরাপত্তা (PCI-DSS) নিশ্চিত করতে সরাসরি ব্রাউজারে কার্ড নম্বর ও CVV গ্রহণ সাময়িকভাবে স্থগিত রাখা হয়েছে। সার্টিফাইড ব্যাংক গেটওয়ে যুক্ত হওয়া পর্যন্ত আমাদের ক্যাশ অন ডেলিভারি অথবা মোবাইল ব্যাংকিং ব্যবহার করার অনুরোধ করা হচ্ছে।'
                          : 'To protect customer card data and comply with PCI-DSS standards, raw card numbers and CVVs are not collected directly in the browser. Please select Cash on Delivery or Mobile Banking (bKash/Nagad/Rocket) for immediate order processing.'}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{store.language === 'bn' ? 'বিকল্প ব্যবস্থা:' : 'Available Methods:'}</span>
                        <div className="flex items-center gap-2 font-bold text-emerald-700">
                          <button
                            type="button"
                            onClick={() => setPaymentType('cod')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 border border-emerald-300 cursor-pointer"
                          >
                            💵 {store.language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType('mfs')}
                            className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 rounded-lg text-pink-800 border border-pink-300 cursor-pointer"
                          >
                            📱 {store.language === 'bn' ? 'বিকাশ / নগদ / রকেট' : 'Mobile Banking'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>256-Bit SSL Encrypted</span>
                      </span>
                      <span className="font-semibold text-slate-600">
                        🛡️ PCI-DSS Level 1 Standards
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="font-bold text-slate-900 mb-2">{t.orderSummary} ({store.cart.length} items)</div>
            <div className="flex justify-between text-slate-600">
              <span>{t.subtotal}</span>
              <span>{store.formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>{t.discount}</span>
                <span>-{store.formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{t.deliveryFee}</span>
              <span>{deliveryFee === 0 ? 'Free' : store.formatPrice(deliveryFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>{t.total}</span>
              <span className="text-base text-amber-600">{store.formatPrice(total)}</span>
            </div>
          </div>

          {/* Instant Alert Notice */}
          <div className="text-[11px] text-slate-600 bg-sky-50 border border-sky-200 p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
              🔔
            </div>
            <div>
              <strong className="text-sky-950 font-bold block">
                {store.language === 'bn' ? 'রিয়েল-টাইম এডমিন অ্যালার্ট:' : 'Instant Telegram Order Dispatch:'}
              </strong>
              <span>
                {store.language === 'bn' 
                  ? 'অর্ডার কনফার্ম করার সাথে সাথেই এডমিন টেলিগ্রাম চ্যানেলে আপনার অর্ডার ও পেমেন্ট বিবরণ পৌঁছে যাবে।'
                  : 'Placing this order automatically sends a live notification with order specs & payment details to our Telegram center.'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || paymentType === 'card'}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-300 disabled:text-slate-600 text-slate-950 font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>{t.placingOrder}</span>
            ) : paymentType === 'card' ? (
              <span className="text-xs">
                {store.language === 'bn' 
                  ? '⚠️ কার্ড গেটওয়ে অনুপলব্ধ — অনুগ্রহ করে COD বা MFS নির্বাচন করুন' 
                  : '⚠️ Card Gateway Unavailable — Please select COD or MFS'}
              </span>
            ) : (
              <>
                <span>
                  {paymentType === 'mfs'
                    ? (store.language === 'bn' ? `অর্ডার ও TrxID নিশ্চিত করুন (${store.formatPrice(total)})` : `Confirm Order with TrxID (${store.formatPrice(total)})`)
                    : `${t.placeOrder} (${store.formatPrice(total)})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
