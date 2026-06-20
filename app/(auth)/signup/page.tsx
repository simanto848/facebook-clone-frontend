import Link from "next/link";
import { User, Mail, Lock, Eye } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Join Your World</h1>

        <p className="mt-6 text-lg text-slate-400 max-w-md">
          Create your account and start sharing your stories with the world.
        </p>

        <div className="mt-12">
          <div className="h-64 rounded-3xl border border-[#1f2937] bg-linear-to-r from-blue-500/20 to-purple-500/20" />
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-white">Create Account</h2>

          <p className="mt-2 text-slate-400">Join the community today</p>

          <form className="mt-8 space-y-5">
            <div>
              <label className="text-sm text-slate-300">Full Name</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <User size={18} className="text-slate-500" />

                <input
                  type="text"
                  placeholder="John Doe"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                />
              </div>
            </div>

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

            <button className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 transition">
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
