import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const checkSession = useAuthStore((state) => state.checkSession);

  return {
    user,
    accessToken,
    loading,
    error,
    register,
    login,
    logout,
    checkSession,
    isAuthenticated: !!user,
  };
};