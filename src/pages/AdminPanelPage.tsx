import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ExternalLink, 
  LogOut, 
  ArrowLeft 
} from 'lucide-react';
import { useShopStore } from '../services/store';
import { AdminDashboard } from '../components/AdminDashboard';
import { navigateTo } from '../utils/router';

export const AdminPanelPage: React.FC = () => {
  const store = useShopStore();
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAdminUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput) return;
    setIsVerifying(true);
    setAdminAuthError('');

    const success = await store.unlockAdminWithBackend(adminPasswordInput);
    setIsVerifying(false);

    if (success) {
      setAdminAuthError('');
      setAdminPasswordInput('');
    } else {
      setAdminAuthError(
        store.language === 'bn' 
          ? 'ভুল এডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে প্রবেশ করুন।' 
          : 'Incorrect admin password! Please enter the correct password.'
      );
    }
  };

  // If not unlocked, require password verification
  if (!store.adminUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-7 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ROUTE: /admin</span>
          </div>

          <h2 className="text-xl font-black tracking-tight mb-1 text-white">
            {store.language === 'bn' ? 'এডমিন প্যানেল ভেরিফিকেশন' : 'Admin Security Verification'}
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {store.language === 'bn' 
              ? 'এডমিন ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে আপনার গোপন এডমিন পাসওয়ার্ড দিন। এটি আপনার শপ ও সেলস সুরক্ষিত রাখে।'
              : 'Enter your shop administrator password to unlock the management dashboard and store controls.'}
          </p>

          <form onSubmit={handleAdminUnlock} className="space-y-4">
            <div className="text-left">
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>{store.language === 'bn' ? 'এডমিন পাসওয়ার্ড *' : 'Admin Password *'}</span>
                <span className="text-[10px] text-amber-400 font-mono">Protected</span>
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  value={adminPasswordInput}
                  onChange={e => {
                    setAdminPasswordInput(e.target.value);
                    if (adminAuthError) setAdminAuthError('');
                  }}
                  placeholder="Enter administrator password"
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 pr-11 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {adminAuthError && (
              <div className="text-xs text-red-300 bg-red-950/60 border border-red-800/80 rounded-xl p-3 text-left animate-in fade-in duration-200">
                ⚠️ {adminAuthError}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="w-1/2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{store.language === 'bn' ? 'স্টোরে ফিরুন (/)' : 'Store Front (/)'}</span>
              </button>
              <button
                type="submit"
                disabled={isVerifying || !adminPasswordInput}
                className="w-1/2 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                {isVerifying 
                  ? (store.language === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...') 
                  : (store.language === 'bn' ? 'আনলক করুন' : 'Unlock Dashboard')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Admin Panel Dashboard View
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Admin Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
            7X
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                7X_SHOP <span className="text-amber-400">Admin Panel</span>
              </h1>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold hidden sm:inline">
                ● Live Connected
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Route: /admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Visit User Storefront Link */}
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Open User Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{store.language === 'bn' ? 'ইউজার স্টোরফ্রন্ট' : 'View Storefront'}</span>
            <span className="text-[10px] text-slate-400 font-mono">( / )</span>
          </button>

          {/* Lock / Logout Admin Session */}
          <button
            onClick={() => store.lockAdmin()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Lock Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{store.language === 'bn' ? 'লক / লগআউট' : 'Lock Session'}</span>
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1">
        <AdminDashboard onBackToStore={() => navigateTo('/')} />
      </main>
    </div>
  );
};
