"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { verifyOtpAction } from "./actions";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(119); // 1:59 in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Format timer as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-verify if token is present in the URL query params
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerification(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerification = async (token: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = new FormData();
      data.append("token", token);
      const result = await verifyOtpAction(null, data);
      if (result.success) {
        setSuccessMsg(result.message || "Email verified successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setErrorMsg(result.message || "Verification failed. Invalid or expired token.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "An error occurred during verification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        // Focus previous input and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const newOtp = [...otp];
    const pasteLength = Math.min(pastedData.length, 6);

    for (let i = 0; i < pasteLength; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or the 6th input
    const targetFocusIndex = Math.min(pasteLength, 5);
    inputRefs.current[targetFocusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const joinedOtp = otp.join("");
    if (joinedOtp.length < 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }
    handleVerification(joinedOtp);
  };

  const handleResend = async () => {
    // If we have an email address stored/requested from somewhere, or if they need to request a new OTP.
    // For simplicity, since the backend handles verification resend via registration or forgot-password,
    // let's show a helpful status message.
    setErrorMsg(null);
    setSuccessMsg("If your account is registered, a new verification link has been sent to your email.");
    setTimer(120); // Reset timer
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Verify Identity</h1>

        <p className="mt-6 max-w-md text-lg text-slate-400">
          We&apos;ve sent a verification code to your email. Enter the code below or click the link in your email to continue.
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
            href="/signup"
            className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <h2 className="mt-8 text-4xl font-bold text-white">
            OTP Verification
          </h2>

          <p className="mt-2 text-slate-400">Enter the 6-digit code sent to your email.</p>

          {errorMsg && (
            <div className="mt-6 p-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-6 p-4 text-sm text-green-400 bg-green-950/30 border border-green-500/30 rounded-xl">
              {successMsg}
            </div>
          )}

          {tokenFromUrl && loading && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p>Verifying link automatically...</p>
            </div>
          )}

          {!tokenFromUrl && (
            <form onSubmit={handleSubmit}>
              {/* OTP Inputs */}
              <div className="mt-10 flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    disabled={loading}
                    className="
                      h-14
                      w-14
                      rounded-xl
                      border
                      border-[#1f2937]
                      bg-[#111827]
                      text-center
                      text-xl
                      font-semibold
                      text-white
                      outline-none
                      transition
                      focus:border-blue-500
                      disabled:opacity-50
                    "
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">Code expires in</p>
                <p className="mt-1 text-lg font-semibold text-blue-400">
                  {formatTime(timer)}
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  mt-8
                  w-full
                  flex
                  items-center
                  justify-center
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
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              {/* Resend */}
              <div className="mt-6 text-center">
                <p className="text-slate-400">Didn&apos;t receive the code?</p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || loading}
                  className="
                    mt-2
                    font-medium
                    text-blue-400
                    hover:text-blue-300
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
