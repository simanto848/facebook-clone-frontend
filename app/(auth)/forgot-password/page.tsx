"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("email", email);
      const result = await forgotPasswordAction(null, data);
      if (result.success) {
        setSuccessMsg(result.message || "A recovery email has been sent successfully.");
        setEmail("");
      } else {
        setErrorMsg(result.message || "Failed to send reset link.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

            <div>
              <label className="text-sm text-slate-300">Email Address</label>

              <div className="mt-2 flex items-center rounded-xl border border-[#1f2937] bg-[#111827] px-4 focus-within:border-blue-500/50 transition-colors">
                <Mail size={18} className="text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-12 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-blue-500 py-3 font-medium text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-[#1f2937] bg-[#111827] p-4">
            <p className="text-sm text-slate-400">
              Remember your password?
              <Link
                href="/login"
                className="ml-2 font-medium text-blue-400 hover:text-blue-300 hover:underline"
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
