import { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin, setToken, getStoredUser, setStoredUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  const login = useCallback(async (email, password) => {
    const data = await apiLogin({ email, password });
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithUser = useCallback((token, u) => {
    setToken(token);
    setStoredUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setStoredUser(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
