"use server";

import { useAxios } from "@/lib/useAxios";

export async function registerAction(state: any, formData: FormData) {
  const displayName = ((formData.get("displayName") as string) || "").trim();
  const username = ((formData.get("username") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const dateOfBirth = ((formData.get("dateOfBirth") as string) || "").trim();
  const gender = ((formData.get("gender") as string) || "").trim();

  // Validate fields on the server
  if (!displayName || !username || !email || !password || !dateOfBirth || !gender) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  try {
    const api = await useAxios();
    // Call the backend registration route
    const response = await api.post("auth/register", {
      displayName,
      username,
      email,
      password,
      dateOfBirth,
      gender,
    });

    return {
      success: true,
      message: (response as any)?.message || "Registration successful! Please check your email to verify your account.",
    };
  } catch (error: any) {
    const errorData = error?.data || error;
    return {
      success: false,
      message: errorData?.message || "Failed to register account. Please try again.",
    };
  }
}
