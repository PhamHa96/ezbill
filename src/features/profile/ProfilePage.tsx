import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/auth.store';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  onClick: () => void;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = user?.displayName ?? 'You';
  const email = user?.email ?? 'you@ezbill.app';
  const username = email.split('@')[0].toLowerCase().replace(/\s+/g, '.');
  const avatarUrl =
    user?.avatarUrl ??
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=ff7da1`;

  const stats: StatCard[] = [
    { label: 'Trips', value: '4', icon: 'flight_takeoff', color: 'bg-blue-50 text-blue-500' },
    { label: 'Expenses', value: '18', icon: 'receipt_long', color: 'bg-pink-50 text-primary' },
    { label: 'Friends', value: '3', icon: 'group', color: 'bg-purple-50 text-purple-500' },
    { label: 'Settled', value: '12', icon: 'check_circle', color: 'bg-green-50 text-green-500' },
  ];

  const settingGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          label: 'Edit Profile',
          onClick: () => alert('Coming soon'),
        },
        {
          icon: 'notifications',
          label: 'Notifications',
          value: 'On',
          onClick: () => alert('Coming soon'),
        },
        {
          icon: 'lock',
          label: 'Privacy',
          onClick: () => alert('Coming soon'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'palette',
          label: 'Appearance',
          value: 'Light',
          onClick: () => alert('Coming soon'),
        },
        {
          icon: 'language',
          label: 'Language',
          value: 'English',
          onClick: () => alert('Coming soon'),
        },
        {
          icon: 'info',
          label: 'About Ezbill',
          value: 'v1.0.0',
          onClick: () => alert('Ezbill v1.0.0 · Made with ❤️'),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'logout',
          label: 'Log Out',
          danger: true,
          onClick: () => setShowLogoutConfirm(true),
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-page animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      {/* Profile card */}
      <div className="mx-6 mt-6 bg-white rounded-3xl shadow-soft p-6 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md"
            />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-white text-[14px]">edit</span>
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-text-main truncate">{displayName}</h2>
            <p className="text-sm text-text-muted font-bold">@{username}</p>
            <p className="text-xs text-text-muted mt-0.5 truncate">{email}</p>
          </div>
        </div>

        {/* Share profile */}
        <button
          onClick={async () => {
            const text = `Add me on Ezbill! 💸\nezbill.app/u/${username}`;
            if (navigator.share) {
              await navigator.share({ title: 'My Ezbill Profile', text });
            } else {
              await navigator.clipboard.writeText(text);
              alert('Profile link copied!');
            }
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
            <div key={s.label} className="bg-white rounded-2xl p-3 shadow-soft flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              </div>
              <p className="text-lg font-black text-text-main leading-none">{s.value}</p>
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
            <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 px-5 py-4 active:bg-surface-page transition-colors ${idx !== group.items.length - 1 ? 'border-[#ffd1dc] border-b' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.danger ? 'bg-red-50' : 'bg-surface-page'}`}>
                    <span className={`material-symbols-outlined text-[20px] ${item.danger ? 'text-red-500' : 'text-text-muted'}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={`flex-1 text-left font-bold text-sm ${item.danger ? 'text-red-500' : 'text-text-main'}`}>
                    {item.label}
                  </span>
                  {item.value && (
                    <span className="text-xs text-text-muted font-bold">{item.value}</span>
                  )}
                  {!item.danger && (
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
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white rounded-t-[32px] w-full px-6 pt-4 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">logout</span>
            </div>
            <h2 className="text-xl font-extrabold text-text-main text-center mb-1">Log Out?</h2>
            <p className="text-sm text-text-muted text-center mb-8">Your data is saved and will be here when you return.</p>
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-full bg-red-500 text-white font-bold text-base mb-3 active:scale-95 transition-transform"
            >
              Log Out
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full py-4 rounded-full text-text-muted font-bold active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
