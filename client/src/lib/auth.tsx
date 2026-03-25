import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", { email, password, name });
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
