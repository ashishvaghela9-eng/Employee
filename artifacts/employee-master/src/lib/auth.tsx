import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { SystemUser, useGetMe } from "@workspace/api-client-react";

interface AuthContextType {
  user: SystemUser | null;
  token: string | null;
  login: (token: string, user: SystemUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [user, setUser] = useState<SystemUser | null>(
    localStorage.getItem("auth_user") ? JSON.parse(localStorage.getItem("auth_user")!) : null
  );
  const [, setLocation] = useLocation();

  const { data: me, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false
    }
  });

  useEffect(() => {
    if (me) {
      setUser(me);
      localStorage.setItem("auth_user", JSON.stringify(me));
    }
    if (isError) {
      logout();
    }
  }, [me, isError]);

  const login = (newToken: string, newUser: SystemUser) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading: isLoading && !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
