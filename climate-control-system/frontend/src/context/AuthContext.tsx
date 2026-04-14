import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { disconnectSocket, setSocketAuthToken } from "../services/socket";
import { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data.data.accessToken as string;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("authUser", JSON.stringify(data.data.user));
    setAccessToken(token);
    setSocketAuthToken(token);
    setUser(data.data.user);
  }

  async function register(name: string, email: string, password: string) {
    await api.post("/auth/register", { name, email, password, role: "user" });
  }

  async function forgotPassword(email: string) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return (data.message as string) || "If that email exists, a reset link has been sent.";
  }

  async function resetPassword(token: string, password: string) {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return (data.message as string) || "Password reset successful";
  }

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    setAccessToken(null);
    setSocketAuthToken(null);
    disconnectSocket();
    setUser(null);
  }, []);

  useEffect(() => {
    setSocketAuthToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, [logout]);

  const value = useMemo(
    () => ({ user, accessToken, login, register, forgotPassword, resetPassword, logout }),
    [user, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
