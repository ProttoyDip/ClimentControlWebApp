import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { api } from "../services/api";
import { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data.data.accessToken as string;
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setUser(data.data.user);
  }

  async function register(name: string, email: string, password: string) {
    await api.post("/auth/register", { name, email, password, role: "user" });
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, accessToken, login, register, logout }),
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
