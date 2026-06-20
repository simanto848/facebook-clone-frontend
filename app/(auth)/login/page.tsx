import Link from "next/link";
import { Eye, Mail, Lock } from "lucide-react";

export default function LoginPage() {
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

          <form className="mt-8 space-y-5">
            <div>
              <label className="text-sm text-slate-300">Email</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Mail size={18} className="text-slate-500" />

                <input
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Lock size={18} className="text-slate-500" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                />

                <Eye size={18} className="text-slate-500 cursor-pointer" />
              </div>
            </div>

            <div className="flex justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" />
                Remember me
              </label>

              <Link href="/forgot-password" className="text-sm text-blue-400">
                Forgot Password?
              </Link>
            </div>

            <button className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 transition">
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
