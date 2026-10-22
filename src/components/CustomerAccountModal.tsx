import React, { useState } from 'react';
import { 
  X, 
  User, 
  Package, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Truck, 
  LogOut, 
  Key,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useShopStore } from '../services/store';
import { OrderStatus } from '../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const store = useShopStore();
  const t = store.t();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Login / Register state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  if (!isOpen) return null;

  const user = store.currentUser;
  const userOrders = user 
    ? store.orders.filter(o => o.phone === user.phone || (user.email && o.email === user.email))
    : [];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    store.loginUser(identifier.trim());
    setAuthMessage('Logged in successfully!');
    setTimeout(() => setAuthMessage(''), 2000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone && !regEmail) return;
    const identifier = regPhone || regEmail;
    const newUser = store.loginUser(identifier);
    if (regName) newUser.name = regName;
    setAuthMessage('Account created successfully!');
    setTimeout(() => setAuthMessage(''), 2000);
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900">
              {user ? user.name : t.myAccount}
            </h2>
            {user?.role === 'admin' && (
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!user ? (
            /* Logged Out / Auth Screens */
            <div className="max-w-md mx-auto py-4">
              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{t.welcomeBack}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t.signInSubtitle}</p>
                  </div>

                  {authMessage && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                      {authMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.emailOrPhone}
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="e.g. 01712345678 or you@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.password}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                      <span>{t.rememberMe}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-amber-600 hover:underline"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    {t.login}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-500">
                    <span>{t.dontHaveAccount} </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      {t.signUp}
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{t.createAccount}</h3>
                    <p className="text-xs text-slate-500 mt-1">Register with your mobile number or email</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fullName}</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Shakil Ahmed"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phone} *</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.email}</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="youremail@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    {t.register}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-500">
                    <span>{t.alreadyHaveAccount} </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      {t.login}
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'forgot' && (
                <div className="space-y-4 text-center">
                  <h3 className="text-base font-bold text-slate-900">{t.forgotPassword}</h3>
                  <p className="text-xs text-slate-500">
                    Enter your registered mobile or email to receive a password reset OTP.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter Phone or Email"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <button
                    onClick={() => {
                      alert('Password reset instructions sent to your phone/email!');
                      setAuthMode('login');
                    }}
                    className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Send OTP
                  </button>
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-slate-500 hover:underline block mx-auto"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged In Portal */
            <div className="space-y-6">
              {/* User Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{user.phone} · {user.email}</div>
                </div>
                <button
                  onClick={() => store.logoutUser()}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout}</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{t.myOrders} ({userOrders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'profile'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t.profile}</span>
                </button>
              </div>

              {/* Orders History List */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      <p>{t.noOrdersYet}</p>
                    </div>
                  ) : (
                    userOrders.map(order => {
                      const step = getStatusStepIndex(order.orderStatus);
                      return (
                        <div key={order.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                            <div>
                              <span className="font-mono font-bold text-slate-900">#{order.id}</span>
                              <span className="text-slate-400 ml-2">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="font-bold text-amber-600 font-mono">
                              {store.formatPrice(order.totalAmount)}
                            </div>
                          </div>

                          {/* Order progress tracker */}
                          <div className="py-2">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                              <span className={step >= 1 ? 'text-amber-600 font-bold' : ''}>1. Placed</span>
                              <span className={step >= 2 ? 'text-blue-600 font-bold' : ''}>2. Processing</span>
                              <span className={step >= 3 ? 'text-purple-600 font-bold' : ''}>3. Shipped</span>
                              <span className={step >= 4 ? 'text-emerald-600 font-bold' : ''}>4. Delivered</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-amber-500 transition-all duration-300"
                                style={{ width: `${(step / 4) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-1.5 text-xs text-slate-700">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px]">
                                <span className="truncate">• {it.productName} (x{it.quantity})</span>
                                <span className="font-bold shrink-0">{store.formatPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Payment: <strong className="uppercase">{order.paymentMethod}</strong></span>
                            <span>Address: {order.district}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Profile Details */}
              {activeTab === 'profile' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Registered Name:</span>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                    <span className="font-semibold font-mono">{user.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Email:</span>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Default Shipping District:</span>
                    <span className="font-semibold">{user.district || 'Dhaka'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
