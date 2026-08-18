import { useAxios } from "@/lib/useAxios";

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const axios = await useAxios();
    const response = await axios.post("/auth/register", payload);
    return response.data;
  },

  login: async (payload: LoginPayload) => {
    const axios = await useAxios();
    const response = await axios.post("/auth/login", payload);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const axios = await useAxios();
    const response = await axios.post("/auth/verify-email", { token });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const axios = await useAxios();
    const response = await axios.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const axios = await useAxios();
    const response = await axios.post("/auth/reset-password", { token, newPassword });
    return response.data;
  },

  logout: async () => {
    const axios = await useAxios();
    const response = await axios.post("/auth/logout");
    return response.data;
  },

  refreshToken: async () => {
    const axios = await useAxios();
    const response = await axios.post("/auth/refresh-token");
    return response.data;
  },

  getMe: async () => {
    const axios = await useAxios();
    const response = await axios.get("/users/me");
    return response.data;
  },
};
