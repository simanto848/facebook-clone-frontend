"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Calendar, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Simple client-side validation
    if (!formData.displayName || !formData.username || !formData.email || !formData.password || !formData.dateOfBirth || !formData.gender) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (formData.username.length < 3) {
      setErrorMsg("Username must be at least 3 characters long.");
      return;
    }

    const result = await register({
      displayName: formData.displayName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
    });

    if (result.success) {
      setSuccessMsg("Account created successfully! Please check your email to verify.");
      setFormData({
        displayName: "",
        username: "",
        email: "",
        password: "",
        dateOfBirth: "",
        gender: "",
      });
      // Optional: Redirect to login or verification page after delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white flex items-center gap-3">
          Join Your World <Sparkles className="text-blue-500" />
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-md">
          Create your account and start sharing your stories with the world.
        </p>

        <div className="mt-12">
          <div className="h-64 rounded-3xl border border-[#1f2937] bg-linear-to-r from-blue-500/20 to-purple-500/20" />
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center p-8 overflow-y-auto my-8">
        <div className="w-full max-w-md bg-[#0b0f19]/80 p-8 rounded-2xl border border-[#1f2937] backdrop-blur-md">
          <h2 className="text-4xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-slate-400">Join the community today</p>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl">
              {successMsg}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-300">Full Name</label>
              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <User size={18} className="text-slate-500" />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Username</label>
              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <User size={18} className="text-slate-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Email</label>
              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Mail size={18} className="text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Date of Birth</label>
                <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                  <Calendar size={18} className="text-slate-500" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="h-12 flex-1 bg-transparent px-3 text-white outline-none [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Gender</label>
                <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="h-12 flex-1 bg-transparent px-3 text-slate-300 outline-none"
                    required
                  >
                    <option value="" disabled className="bg-[#111827]">Select</option>
                    <option value="male" className="bg-[#111827] text-white">Male</option>
                    <option value="female" className="bg-[#111827] text-white">Female</option>
                    <option value="other" className="bg-[#111827] text-white">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Lock size={18} className="text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 focus:outline-none hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
