"use server";

import { useAxios } from "@/lib/useAxios";

export async function loginAction(state: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required.",
    };
  }

  try {
    const api = await useAxios();
    const response = await api.post("auth/login", {
      email,
      password,
    });

    return {
      success: true,
      message: (response as any)?.message || "Login successful.",
      data: (response as any)?.data,
    };
  } catch (error: any) {
    const errorData = error?.data || error;
    return {
      success: false,
      message: errorData?.message || "Failed to log in. Please try again.",
    };
  }
}
