"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { authService } from "@/services/authService";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg("Verification token missing in link.");
      return;
    }

    const executeVerify = async () => {
      try {
        await authService.verifyEmail(token);
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err: any) {
        setErrorMsg(err.message || err.response?.data?.message || "Invalid or expired verification token.");
      } finally {
        setLoading(false);
      }
    };

    executeVerify();
  }, [token, router]);

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl text-center space-y-6">
      {loading ? (
        <div className="py-8 space-y-4">
          <Loader2 size={40} className="animate-spin text-blue-500 mx-auto" />
          <h2 className="text-xl font-bold">Verifying Email...</h2>
          <p className="text-xs text-slate-400">Please wait while we confirm your email address.</p>
        </div>
      ) : success ? (
        <div className="py-6 space-y-4">
          <CheckCircle2 size={48} className="text-green-400 mx-auto" />
          <h2 className="text-2xl font-extrabold text-white">Email Verified!</h2>
          <p className="text-xs text-slate-300">Your account is now verified. Redirecting you to sign in...</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition mt-2"
          >
            <span>Go to Login</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="py-6 space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
          <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="rounded-xl bg-[#1f2937] hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-white transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="animate-spin text-blue-500" size={32} />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
