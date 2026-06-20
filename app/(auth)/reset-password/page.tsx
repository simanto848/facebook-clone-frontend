import Link from "next/link";
import { ArrowLeft, Eye, Lock, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Create New Password</h1>

        <p className="mt-6 max-w-md text-lg text-slate-400">
          Your new password must be different from previously used passwords and
          should be strong enough to protect your account.
        </p>

        <div className="mt-12 flex items-center justify-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
            <ShieldCheck size={80} className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/verify-otp"
            className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <h2 className="mt-8 text-4xl font-bold text-white">Reset Password</h2>

          <p className="mt-2 text-slate-400">
            Create a secure password for your account.
          </p>

          <form className="mt-8 space-y-5">
            {/* New Password */}
            <div>
              <label className="text-sm text-slate-300">New Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Lock size={18} className="text-slate-500" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                />

                <Eye size={18} className="cursor-pointer text-slate-500" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-slate-300">Confirm Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4">
                <Lock size={18} className="text-slate-500" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none"
                />

                <Eye size={18} className="cursor-pointer text-slate-500" />
              </div>
            </div>

            {/* Password Rules */}
            <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-4">
              <h4 className="mb-3 text-sm font-medium text-white">
                Password Requirements
              </h4>

              <ul className="space-y-2 text-sm text-slate-400">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
                <li>• One special character</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
                w-full
                rounded-xl
                bg-blue-500
                py-3
                font-medium
                text-white
                transition
                hover:bg-blue-600
              "
            >
              Update Password
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
