"use server";

import { useAxios } from "@/lib/useAxios";

export async function resetPasswordAction(state: any, formData: FormData) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!token || !newPassword) {
    return {
      success: false,
      message: "Missing token or password.",
    };
  }

  try {
    const api = await useAxios();
    const response = await api.post("auth/reset-password", {
      token,
      newPassword,
    });

    return {
      success: true,
      message: (response as any)?.message || "Password updated successfully!",
    };
  } catch (error: any) {
    const errorData = error?.data || error;
    return {
      success: false,
      message: errorData?.message || "Failed to reset password. The link may have expired.",
    };
  }
}
