import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

type User = { id: number; email: string; name: string; role: string; organization_id: number } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    // We don’t have a /me endpoint yet; quick hack: mark as logged-in
    setUser({ id: 0, email, name: email.split("@")[0], role: "pss_owner", organization_id: 1 });
  };

  const register = async (email: string, name: string, password: string) => {
    await api.post("/api/auth/register", { email, name, password, role: "pss_owner" });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
