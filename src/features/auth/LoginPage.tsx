import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { Button } from "../../components/ui/Button";
import { IoMdMail } from "react-icons/io";
import { FaLock } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    await login({
      id: crypto.randomUUID(),
      email,
      displayName: email.split("@")[0],
    });

    navigate("/", { replace: true });
  };

  return (
    <div className="relative z-10 flex flex-col px-8 pt-12 pb-10 min-h-screen overflow-y-auto hide-scrollbar bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-pink-100 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* Header / Mascot */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-4">
          <div className="text-[120px] leading-none select-none">🐱</div>
          <div className="absolute -bottom-2 -right-4 bg-white border-2 border-primary px-4 py-2 rounded-2xl shadow-lg transform rotate-6">
            <p className="text-primary font-extrabold text-sm whitespace-nowrap">
              Welcome ! ✨
            </p>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mt-6 text-center">
          EzeBill
        </h1>
        <p className="text-primary/70 font-semibold text-center mt-1">
          Split bills with your besties!
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600 ml-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-primary/50">
              <IoMdMail />
            </span>
            <input
              className="w-full pl-12 pr-4 py-4 bg-background-soft border-[#ffd1dc] border-2 rounded-2xl
                         focus:ring-2 focus:ring-primary focus:border-primary transition-all
                         outline-none placeholder:text-gray-400 font-medium"
              placeholder="hello@bestie.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600 ml-1">
            Password
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-primary/50">
              <FaLock />
            </span>
            <input
              className="w-full pl-12 pr-12 py-4 bg-background-soft border-[#ffd1dc] border-2 rounded-2xl
                         focus:ring-2 focus:ring-primary focus:border-primary transition-all
                         outline-none placeholder:text-gray-400 font-medium"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="material-symbols-outlined absolute right-4 text-gray-400 cursor-pointer select-none"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
            </span>
          </div>

          <div className="flex justify-end mt-1">
            <button type="button" className="text-xs font-bold text-primary">
              Forgot Password?
            </button>
          </div>
        </div>
        <Button>Sign In</Button>
      </form>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-sm font-bold text-gray-500">
          Don&apos;t have an account?
          <button
            onClick={() => navigate("/signup")}
            className="text-vibrant-rose hover:underline ml-1"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
