import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Sparkles,
  Truck
} from 'lucide-react';
import { useShopStore } from '../services/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
  onShopMore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
  onShopMore,
}) => {
  const store = useShopStore();
  const t = store.t();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = store.getCartSubtotal();
  const discount = store.getCartDiscount(subtotal);
  const deliveryFee = store.getCartDeliveryFee(subtotal);
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const freeThreshold = 2000;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = store.applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                {t.cart} ({store.cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-100 text-xs">
            {remainingForFree > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {store.language === 'bn'
                        ? `আর ${store.formatPrice(remainingForFree)} টাকার পণ্য কিনলেই ফ্রি শিপিং!`
                        : `Add ${store.formatPrice(remainingForFree)} more for FREE Doorstep Delivery!`}
                    </span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>🎉 You qualify for FREE Nationwide Delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
            {store.cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">{t.emptyCart}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Browse through our electronics, gadgets, and apparel to add items to your cart.
                </p>
                <button
                  onClick={() => { onClose(); onShopMore(); }}
                  className="mt-5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
                >
                  {t.shopNow}
                </button>
              </div>
            ) : (
              store.cart.map((item, index) => {
                const displayName = store.language === 'bn' ? item.product.nameBn : item.product.nameEn;
                const unitPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={`${item.product.id}-${index}`} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.nameEn}
                      className="w-18 h-18 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {displayName}
                        </h4>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                            {item.selectedColor && item.selectedSize && ' · '}
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                          </p>
                        )}
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          {store.formatPrice(unitPrice)}
                        </p>
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-slate-200 rounded bg-slate-50 text-xs">
                          <button
                            onClick={() => store.updateCartQuantity(index, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => store.updateCartQuantity(index, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => store.removeFromCart(index)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {store.cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-4">
              {/* Coupon input */}
              <div>
                {store.appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{store.appliedCoupon.code} applied</span>
                    </div>
                    <button
                      onClick={() => store.removeCoupon()}
                      className="text-xs text-red-600 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      placeholder={t.couponCode}
                      className="flex-1 bg-white border border-slate-300 text-xs rounded-lg px-3 py-2 outline-none uppercase font-mono placeholder:normal-case focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                    >
                      {t.applyCoupon}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
                )}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <span>Try:</span>
                  <button 
                    onClick={() => { setCouponInput('7XSPECIAL'); }}
                    className="font-mono text-amber-700 underline font-semibold"
                  >
                    7XSPECIAL
                  </button>
                  <span>(10% off)</span>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/70 pt-3">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-800">{store.formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{t.discount}</span>
                    <span>-{store.formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.deliveryFee}</span>
                  <span className="font-semibold text-slate-800">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                    ) : (
                      store.formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t.total}</span>
                  <span className="text-base text-amber-600">{store.formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{t.checkout} (Cash on Delivery)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
