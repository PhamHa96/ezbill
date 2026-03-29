import { NavLink, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { PiAirplaneInFlight } from "react-icons/pi";

export default function BottomTab() {
  const navigate = useNavigate();
  const base =
    'flex flex-col items-center gap-1 text-xs font-bold';
  const active = 'text-[#FF7DA1]';
  const inactive = 'text-text-muted';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-[#ffd1dc]/30 px-8 pt-4 pb-safe" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="grid grid-cols-5 items-center">
        <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <span className="material-symbols-outlined text-2xl">home</span>
          Home
        </NavLink>

        <NavLink to="/trips" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <PiAirplaneInFlight className="text-2xl" />
          Trips
        </NavLink>

        {/* Floating Add — centered via grid */}
        <div className="flex justify-center">
          <button onClick={() => navigate('/expense/create')} className="-mt-10 w-14 h-14 rounded-full bg-pink-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>

        <NavLink to="/friends" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <span className="material-symbols-outlined text-2xl">favorite</span>
          Friends
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <CgProfile className="text-2xl" />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}