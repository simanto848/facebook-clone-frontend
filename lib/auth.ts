/**
 * Mock helper functions for authenticated session tokens.
 * Currently returns null as we do register/login actions.
 */

export async function getAnyAuthToken(): Promise<string | null> {
  return null;
}

export interface UserInfo {
  user_id: string | number;
  user_type: string;
}

export async function getUserIdAndType(): Promise<UserInfo | null> {
  return null;
}
