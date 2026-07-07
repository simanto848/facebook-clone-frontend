"use server";

import { useAxios } from "@/lib/useAxios";

export async function verifyOtpAction(state: any, formData: FormData) {
  const token = formData.get("token") as string;

  if (!token) {
    return {
      success: false,
      message: "Verification code is required.",
    };
  }

  try {
    const api = await useAxios();
    const response = await api.post("auth/verify-email", {
      token,
    });

    return {
      success: true,
      message: (response as any)?.message || "Email verified successfully!",
    };
  } catch (error: any) {
    const errorData = error?.data || error;
    return {
      success: false,
      message: errorData?.message || "Verification failed. Invalid or expired token.",
    };
  }
}
