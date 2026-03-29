import { IoIosNotifications } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const avatarUrl = user?.avatarUrl ??
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.displayName ?? 'Me')}&backgroundColor=ff7da1`;

  return (
    <header className="flex items-center justify-between px-6 pt-safe pb-4" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center">
        <img
          src={avatarUrl}
          className="w-12 h-12 rounded-full object-cover border-2 border-[#ffd1dc] cursor-pointer active:opacity-80 transition-opacity"
          onClick={() => navigate('/profile')}
        />
      </div>
      <div className="flex items-center">
        {/* logo slot */}
      </div>
      <button className="w-12 h-12 rounded-full bg-surface-card shadow flex items-center justify-center">
        <IoIosNotifications className="text-[#FF7DA1] text-[30px]" />
      </button>
    </header>
  );
}
