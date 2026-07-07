"use server";

import { useAxios } from "@/lib/useAxios";

export async function forgotPasswordAction(state: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      success: false,
      message: "Email address is required.",
    };
  }

  try {
    const api = await useAxios();
    const response = await api.post("auth/forgot-password", {
      email,
    });

    return {
      success: true,
      message: (response as any)?.message || "A recovery email has been sent successfully.",
    };
  } catch (error: any) {
    const errorData = error?.data || error;
    return {
      success: false,
      message: errorData?.message || "Failed to send reset link. Please try again.",
    };
  }
}
