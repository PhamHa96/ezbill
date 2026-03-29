import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/auth.store';
import { useAppStore } from '../../stores/appStore';
import type { Theme, Currency } from '../../stores/appStore';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { theme, currency, setTheme, setCurrency } = useAppStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.displayName ?? 'You';
  const email = user?.email ?? 'you@ezbill.app';
  const username = email.split('@')[0].toLowerCase().replace(/\s+/g, '.');
  const avatarUrl =
    user?.avatarUrl ??
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=ff7da1`;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const stats: StatCard[] = [
    { label: 'Trips', value: '4', icon: 'flight_takeoff', color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Expenses', value: '18', icon: 'receipt_long', color: 'bg-primary/10 text-primary' },
    { label: 'Friends', value: '3', icon: 'group', color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Settled', value: '12', icon: 'check_circle', color: 'bg-green-500/10 text-green-500' },
  ];

  const settingGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', onClick: () => alert('Coming soon') },
        { icon: 'notifications', label: 'Notifications', value: 'On', onClick: () => alert('Coming soon') },
        { icon: 'lock', label: 'Privacy', onClick: () => alert('Coming soon') },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: theme === 'dark' ? 'dark_mode' : 'light_mode',
          label: 'Appearance',
          value: theme === 'dark' ? 'Dark' : 'Light',
          onClick: () => setShowThemeSheet(true),
        },
        {
          icon: 'payments',
          label: 'Currency',
          value: currency === 'VND' ? '₫ VND' : '$ USD',
          onClick: () => setShowCurrencySheet(true),
        },
        { icon: 'info', label: 'About Ezbill', value: 'v1.0.0', onClick: () => alert('Ezbill v1.0.0 · Made with ❤️') },
      ],
    },
    {
      title: '',
      items: [
        { icon: 'logout', label: 'Log Out', danger: true, onClick: () => setShowLogoutConfirm(true) },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-page animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* Profile card */}
      <div className="mx-6 mt-6 bg-surface-card rounded-3xl shadow-soft p-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#ffd1dc] shadow-md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-white text-[14px]">edit</span>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-text-primary truncate">{displayName}</h2>
            <p className="text-sm text-text-muted font-bold">@{username}</p>
            <p className="text-xs text-text-muted mt-0.5 truncate">{email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            const text = `Add me on Ezbill! 💸\nezbill.app/u/${username}`;
            if (navigator.share) await navigator.share({ title: 'My Ezbill Profile', text });
            else { await navigator.clipboard.writeText(text); alert('Profile link copied!'); }
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-primary/10 text-primary font-bold text-sm active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[16px]">share</span>
          Share My Profile
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-surface-card rounded-2xl p-3 shadow-soft flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              </div>
              <p className="text-lg font-black text-text-primary leading-none">{s.value}</p>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 mt-5 flex flex-col gap-5">
        {settingGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 px-1">
                {group.title}
              </p>
            )}
            <div className="bg-surface-card rounded-3xl shadow-soft overflow-hidden">
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 px-5 py-4 active:bg-surface-page transition-colors ${idx !== group.items.length - 1 ? 'border-b border-[#ffd1dc]' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${'danger' in item && item.danger ? 'bg-red-50' : 'bg-surface-page'}`}>
                    <span className={`material-symbols-outlined text-[20px] ${'danger' in item && item.danger ? 'text-red-500' : 'text-text-muted'}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={`flex-1 text-left font-bold text-sm ${'danger' in item && item.danger ? 'text-red-500' : 'text-text-primary'}`}>
                    {item.label}
                  </span>
                  {'value' in item && item.value && (
                    <span className="text-xs text-text-muted font-bold">{item.value}</span>
                  )}
                  {!('danger' in item && item.danger) && (
                    <span className="material-symbols-outlined text-text-muted text-[18px]">chevron_right</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout confirm sheet */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-surface-card rounded-t-[32px] w-full px-6 pt-4 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">logout</span>
            </div>
            <h2 className="text-xl font-extrabold text-text-primary text-center mb-1">Log Out?</h2>
            <p className="text-sm text-text-muted text-center mb-8">Your data is saved and will be here when you return.</p>
            <button onClick={handleLogout} className="w-full py-4 rounded-full bg-red-500 text-white font-bold text-base mb-3 active:scale-95 transition-transform">Log Out</button>
            <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 rounded-full text-text-muted font-bold active:scale-95 transition-transform">Cancel</button>
          </div>
        </div>
      )}

      {/* Theme sheet */}
      {showThemeSheet && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowThemeSheet(false)} />
          <div className="relative bg-surface-card rounded-t-[32px] w-full px-6 pt-4 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-extrabold text-text-primary mb-2">Appearance</h2>
            <p className="text-sm text-text-muted mb-6">Choose your preferred theme</p>
            <div className="flex flex-col gap-3">
              {(['light', 'dark'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTheme(t); setShowThemeSheet(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 ${theme === t ? 'border-primary bg-primary/10' : 'border-[#ffd1dc] bg-surface-page'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t === 'dark' ? 'bg-[#1e1228]' : 'bg-[#FFF6F7]'} border border-[#ffd1dc]`}>
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      {t === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                  <span className="font-bold text-text-primary capitalize flex-1 text-left">{t === 'dark' ? 'Dark' : 'Light'}</span>
                  {theme === t && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency sheet */}
      {showCurrencySheet && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCurrencySheet(false)} />
          <div className="relative bg-surface-card rounded-t-[32px] w-full px-6 pt-4 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-extrabold text-text-primary mb-2">Currency</h2>
            <p className="text-sm text-text-muted mb-6">Choose your display currency</p>
            <div className="flex flex-col gap-3">
              {([
                { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
                { code: 'VND', symbol: '₫', name: 'Vietnamese Đồng', flag: '🇻🇳' },
              ] as { code: Currency; symbol: string; name: string; flag: string }[]).map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setShowCurrencySheet(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 ${currency === c.code ? 'border-primary bg-primary/10' : 'border-[#ffd1dc] bg-surface-page'}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-surface-page border border-[#ffd1dc]">
                    {c.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-text-primary">{c.symbol} {c.code}</p>
                    <p className="text-xs text-text-muted">{c.name}</p>
                  </div>
                  {currency === c.code && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
