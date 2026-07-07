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
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  login: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  loading: false,
  error: null,

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/auth/register", data);
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
      const response = await axios.post("/api/auth/login", data);
      const { user, accessToken } = response.data.data || {};
      
      // Set default auth header for all subsequent API requests
      if (accessToken) {
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
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, accessToken: null, loading: false });
    }
  },

  checkSession: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/auth/me");
      const { accessToken, user } = response.data.data || {};
      
      if (accessToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      }
      
      set({ accessToken, user, loading: false });
    } catch (err) {
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, accessToken: null, loading: false });
    }
  },
}));