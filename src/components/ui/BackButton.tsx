import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="size-10 flex items-center justify-center bg-white rounded-full text-primary shadow-sm active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-[20px] text-[#FF7DA1]">
          <IoChevronBack />
        </span>
      </button>
    </div>
  );
}
