"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      const result = await login({ email, password, rememberMe });
      if (result.success) {
        router.push("/");
      } else {
        setErrorMsg(result.message || "Failed to log in. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Your World</h1>

        <p className="mt-6 text-lg text-slate-400 max-w-md">
          Connect with friends, share moments, discover communities and stay
          connected with the people that matter most.
        </p>

        <div className="mt-12">
          <div className="h-64 w-full rounded-3xl bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-[#1f2937]" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-white">Welcome Back</h2>

          <p className="mt-2 text-slate-400">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {errorMsg && (
              <div className="p-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300">Email</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4 focus-within:border-blue-500/50 transition-colors">
                <Mail size={18} className="text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4 focus-within:border-blue-500/50 transition-colors">
                <Lock size={18} className="text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1f2937] bg-[#111827] text-blue-500 focus:ring-0 focus:ring-offset-0"
                  disabled={loading}
                />
                Remember me
              </label>

              <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
