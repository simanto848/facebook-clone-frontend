"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { resetPasswordAction } from "./actions";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Requirements checks
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const allRequirementsMet = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!token) {
      setErrorMsg("Missing password reset token. Please request a new password reset email.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (!allRequirementsMet) {
      setErrorMsg("Please satisfy all password requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("token", token);
      data.append("newPassword", newPassword);
      const result = await resetPasswordAction(null, data);

      if (result.success) {
        setSuccessMsg(result.message || "Password updated successfully! Redirecting to login...");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setErrorMsg(result.message || "Failed to reset password. The link may have expired.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Create New Password</h1>

        <p className="mt-6 max-w-md text-lg text-slate-400">
          Your new password must be different from previously used passwords and should be strong enough to protect your account.
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
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <h2 className="mt-8 text-4xl font-bold text-white">Reset Password</h2>

          <p className="mt-2 text-slate-400">
            Create a secure password for your account.
          </p>

          {!token && (
            <div className="mt-6 p-4 flex gap-3 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-xl">
              <XCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                No token found in the URL. Please verify your password reset link or request a new one from the Forgot Password page.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {errorMsg && (
              <div className="p-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-xl">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 flex items-start gap-3 text-sm text-green-400 bg-green-950/30 border border-green-500/30 rounded-xl">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="text-sm text-slate-300">New Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4 focus-within:border-blue-500/50 transition-colors">
                <Lock size={18} className="text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-slate-300">Confirm Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4 focus-within:border-blue-500/50 transition-colors">
                <Lock size={18} className="text-slate-500" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Rules */}
            <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-4">
              <h4 className="mb-3 text-sm font-medium text-white">
                Password Requirements
              </h4>

              <ul className="space-y-2 text-sm">
                <li className={`flex items-center gap-2 ${checks.length ? "text-green-400" : "text-slate-400"}`}>
                  <span className="text-xs">{checks.length ? "✓" : "•"}</span> At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${checks.uppercase ? "text-green-400" : "text-slate-400"}`}>
                  <span className="text-xs">{checks.uppercase ? "✓" : "•"}</span> One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${checks.lowercase ? "text-green-400" : "text-slate-400"}`}>
                  <span className="text-xs">{checks.lowercase ? "✓" : "•"}</span> One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${checks.number ? "text-green-400" : "text-slate-400"}`}>
                  <span className="text-xs">{checks.number ? "✓" : "•"}</span> One number
                </li>
                <li className={`flex items-center gap-2 ${checks.special ? "text-green-400" : "text-slate-400"}`}>
                  <span className="text-xs">{checks.special ? "✓" : "•"}</span> One special character
                </li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !token || !allRequirementsMet}
              className="
                w-full
                flex
                justify-center
                items-center
                gap-2
                rounded-xl
                bg-blue-500
                py-3
                font-medium
                text-white
                transition
                hover:bg-blue-600
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
