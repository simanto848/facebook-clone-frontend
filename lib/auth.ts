/**
 * Session token management and retrieval utilities.
 */

export async function getAnyAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}

export interface UserInfo {
  user_id: string | number;
  user_type: string;
}

export async function getUserIdAndType(): Promise<UserInfo | null> {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem("authUser");
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson);
    return {
      user_id: user.id || user._id,
      user_type: user.role || "USER",
    };
  } catch {
    return null;
  }
}
