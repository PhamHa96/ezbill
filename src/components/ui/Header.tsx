import { FaHeart } from "react-icons/fa6";
import { IoIosNotifications } from "react-icons/io";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 pt-safe pb-4" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center">
        <img
          src="https://i.pravatar.cc/100?img=32"
          className="w-12 h-12 rounded-full object-cover border border-white border-3"
        />
      </div>
      <div className="flex items-center">
        <span className="font-extrabold text-[#FF7DA1] text-[22px]">
          <FaHeart className="inline-block" /> EzeBill
        </span>
      </div>
      <button className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
        <IoIosNotifications className="text-[#FF7DA1] text-[30px]" />
      </button>
    </header>
  );
}
