import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './auth.store';
import { IoMdEye, IoMdEyeOff, IoMdMail } from 'react-icons/io';
import { FaLock } from 'react-icons/fa6';
import { IoPersonCircleSharp } from "react-icons/io5";
import { SiAdguard } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";
import { IoLogoApple } from "react-icons/io5";
import { BackButton } from '../../components/ui/BackButton';
export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) return;
    if (formData.password !== formData.confirmPassword) return;

    // mock register + auto login
    await login({
      id: crypto.randomUUID(),
      email: formData.email,
      displayName: formData.fullName || formData.email.split('@')[0],
    });

    navigate('/', { replace: true });
  };

  return (
    <div className="relative flex flex-col min-h-full bg-background-soft overflow-y-auto hide-scrollbar">
      {/* Back Button */}
      <BackButton />

      <div className="flex-1 flex flex-col px-6 pt-4 pb-12 relative">
        {/* Peeking Mascot */}
        <div className="absolute -top-10 right-8 z-10 select-none">
          <div className="relative">
            <div className="text-[80px] leading-none transform -rotate-12 translate-y-4">
              🐱
            </div>
            <div className="absolute -top-2 -right-1 text-2xl">✨</div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-[#ffd1dc] relative z-20">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-700 leading-tight">
              Join the<br />
              <span className="text-primary">EzeBill</span> family!
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Split bills with your besties, purely cute!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#FF7DA1] text-xl">
                  <IoPersonCircleSharp />
                </span>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-pink-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4
                             text-gray-700 placeholder:text-pink-200
                             focus:border-[#FF7DA1] outline-none transition-all font-medium"
                  placeholder="Pinky Promise"
                  type="text"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#FF7DA1] text-xl">
                  <IoMdMail />
                </span>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-pink-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4
                             text-gray-700 placeholder:text-pink-200
                             focus:border-[#FF7DA1] outline-none transition-all font-medium"
                  placeholder="hello@ezebill.com"
                  type="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#FF7DA1] text-xl">
                   <FaLock />
                </span>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-pink-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-12
                             text-gray-700 placeholder:text-pink-200
                             focus:border-[#FF7DA1] outline-none transition-all font-medium"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <span
                  onClick={() => setShowPassword(v => !v)}
                  className="material-symbols-outlined absolute right-4 top-1/2
                             -translate-y-1/2 text-[#FF7DA1] text-xl cursor-pointer select-none"
                >
                  {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#FF7DA1] text-xl">
                  <SiAdguard />
                </span>
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-pink-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4
                             text-gray-700 placeholder:text-pink-200
                             focus:border-[#FF7DA1] outline-none transition-all font-medium"
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff85a1] hover:bg-primary-hover text-white
                         font-extrabold py-4 rounded-3xl shadow-lg
                         transition-all active:scale-95 mt-4 text-lg"
            >
              Create Account
            </button>
          </form>

          {/* Social */}
          <div className="mt-8 text-center">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ffd1dc]"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
                Or sign up with
              </span>
            </div>

            <div className="flex gap-4 justify-center">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#ffd1dc]
                                 h-14 rounded-2xl hover:bg-pink-50 transition-colors shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[#FF7DA1] text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  <FaGoogle />
                </span>
                <span className="text-sm font-bold text-gray-700">
                  Google
                </span>
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 bg-black
                                 h-14 rounded-2xl hover:bg-gray-900 transition-colors shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[#FF7DA1] text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  <IoLogoApple />
                </span>
                <span className="text-sm font-bold text-white">
                  Apple
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-500">
            Already a member?
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-bold hover:underline ml-1"
            >
              Log In
            </button>
          </p>
        </div>

        {/* Cute footer */}
        <div className="mt-auto pt-8 flex justify-center items-end gap-2 opacity-40">
          <span className="text-2xl">🐾</span>
          <span className="text-2xl">🐾</span>
          <span className="text-2xl">🐾</span>
        </div>
      </div>
    </div>
  );
};
