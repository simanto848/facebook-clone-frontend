import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-linear-to-br from-[#111827] to-[#1e293b]">
        <h1 className="text-6xl font-bold text-white">Verify Identity</h1>

        <p className="mt-6 max-w-md text-lg text-slate-400">
          We&apos;ve sent a verification code to your email. Enter the code
          below to continue.
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

          <h2 className="mt-8 text-4xl font-bold text-white">
            OTP Verification
          </h2>

          <p className="mt-2 text-slate-400">Enter the 6-digit code sent to</p>

          <p className="mt-1 font-medium text-blue-400">john@example.com</p>

          {/* OTP Inputs */}
          <div className="mt-10 flex justify-between gap-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <input
                key={item}
                type="text"
                maxLength={1}
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
                "
              />
            ))}
          </div>

          {/* Timer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">Code expires in</p>

            <p className="mt-1 text-lg font-semibold text-blue-400">01:59</p>
          </div>

          {/* Verify Button */}
          <button
            className="
              mt-8
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
            Verify OTP
          </button>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">Didn&apos;t receive the code?</p>

            <button
              className="
                mt-2
                font-medium
                text-blue-400
                hover:text-blue-300
              "
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
