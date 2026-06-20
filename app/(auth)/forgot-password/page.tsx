import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Password Recovery</h1>

        <p className="mt-6 max-w-md text-lg text-slate-400">
          Don&apos;t worry. Enter your email address and we&apos;ll send you
          instructions to reset your password.
        </p>

        <div className="mt-12">
          <div className="h-64 rounded-3xl border border-[#1f2937] bg-linear-to-r from-blue-500/20 to-purple-500/20" />
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <h2 className="mt-8 text-4xl font-bold text-white">
            Forgot Password
          </h2>

          <p className="mt-2 text-slate-400">
            Enter your email to receive a password reset link.
          </p>

          <form className="mt-8 space-y-6">
            <div>
              <label className="text-sm text-slate-300">Email Address</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Mail size={18} className="text-slate-500" />

                <input
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white transition hover:bg-blue-600"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-[#1f2937] bg-[#111827] p-4">
            <p className="text-sm text-slate-400">
              Remember your password?
              <Link
                href="/login"
                className="ml-2 font-medium text-blue-400 hover:text-blue-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
