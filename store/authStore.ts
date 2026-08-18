import { create } from "zustand";
import axios from "axios";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  avatar?: string;
  role?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  login: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  initAuth: () => void;
}
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,
  error: null,

  initAuth: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const userJson = localStorage.getItem("authUser");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        set({ accessToken: token, user, initialized: true });
        return;
      } catch {
        // Fallback
      }
    }
    set({ initialized: true });
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/register`, data);
      set({ loading: false });
      return { success: true, message: response.data.message || "Registration successful." };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to register.";
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, data);
      const { user, accessToken } = response.data.data || response.data || {};

      if (accessToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        if (user) localStorage.setItem("authUser", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      }

      set({ user, accessToken, loading: false });
      return { success: true, message: response.data.message || "Login successful." };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to login.";
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post(`${apiBaseUrl}/auth/logout`);
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
      }
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, accessToken: null, loading: false });
    }
  },

  checkSession: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/me`);
      const { accessToken, user } = response.data.data || {};

      if (accessToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        if (user) localStorage.setItem("authUser", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      }

      set({ accessToken, user, loading: false, initialized: true });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
      }
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, accessToken: null, loading: false, initialized: true });
    }
  },
}));