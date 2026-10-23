import React from 'react';
import { 
  CheckCircle2, 
  Send, 
  ShoppingBag, 
  FileText, 
  Truck, 
  Copy, 
  Check, 
  PhoneCall 
} from 'lucide-react';
import { Order } from '../types';
import { useShopStore } from '../services/store';
import { formatTelegramOrderMessage } from '../server/telegramService';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewAccountOrders: () => void;
  onContinueShopping: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewAccountOrders,
  onContinueShopping,
}) => {
  const store = useShopStore();
  const t = store.t();
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const telegramPreview = formatTelegramOrderMessage(order);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderNumber || `#${order.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t.orderSuccessTitle}
          </h2>
          <p className="text-emerald-100 text-xs mt-1 max-w-md mx-auto">
            {t.orderSuccessMsg}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-slate-950/30 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-white/20 font-mono text-xs">
            <span>{t.orderIdText}: <strong>#{order.id}</strong></span>
            <button
              onClick={handleCopyId}
              className="text-white hover:text-amber-300 ml-1 transition"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Real-time Telegram notification dispatched proof badge */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                <Send className="w-4 h-4 text-sky-600 animate-bounce" />
                <span>Instant Telegram Order Alert Dispatched</span>
              </div>
              <span className="text-[10px] bg-sky-200/70 text-sky-800 px-2 py-0.5 rounded font-mono">
                {store.telegramConfig.chatId}
              </span>
            </div>
            <div className="bg-slate-950 text-slate-200 rounded-lg p-3 text-[11px] font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
              {telegramPreview}
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
              <span>Delivery Details</span>
              <span className={`font-semibold uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                order.paymentMethod === 'cod' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : order.paymentMethod === 'bkash' 
                  ? 'bg-pink-100 text-pink-800' 
                  : order.paymentMethod === 'nagad' 
                  ? 'bg-orange-100 text-orange-800' 
                  : order.paymentMethod === 'rocket'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.paymentMethod === 'cod' 
                  ? '💵 Cash on Delivery' 
                  : `📱 ${order.paymentMethod.toUpperCase()} Mobile Banking`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer:</span>
                <span className="font-semibold text-slate-800">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone:</span>
                <span className="font-semibold font-mono text-slate-800">{order.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Shipping Address:</span>
                <span className="font-medium text-slate-800">{order.address}, {order.district}</span>
              </div>
              {order.trxId && (
                <div className="col-span-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                      Verified TrxID:
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                      Payment Submitted
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900 tracking-wider text-xs block mt-0.5">
                    {order.trxId}
                  </span>
                  {order.senderNumber && (
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Sender Phone: <strong className="font-mono text-slate-800">{order.senderNumber}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Item list */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block">Ordered Items ({order.items.length}):</span>
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-slate-700 bg-slate-50 p-2 rounded">
                  <div className="flex items-center gap-2 truncate">
                    {it.productImage ? (
                      <img src={it.productImage} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-200 shrink-0" />
                    )}
                    <span className="truncate">{it.productName} (x{it.quantity})</span>
                  </div>
                  <span className="font-bold shrink-0">{store.formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-2 flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-200">
              <span>Total Payable Amount:</span>
              <span className="text-base text-amber-600 font-mono">{store.formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                onClose();
                onViewAccountOrders();
              }}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t.viewOrderDetails}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onContinueShopping();
              }}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.continueShopping}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
