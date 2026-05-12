import { useState, useEffect } from "react";
import type { User } from "@/types";
import { MOCK_USER } from "@/constants/data";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mindease_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, _password: string, name?: string) => {
    const userData: User = {
      ...MOCK_USER,
      name: name || (email.includes("alex") ? "Alex Johnson" : email.split("@")[0]),
      email,
    };
    localStorage.setItem("mindease_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("mindease_user");
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    const stored = localStorage.getItem("mindease_user");
    if (!stored) return;
    const currentUser = JSON.parse(stored);
    const updated = { ...currentUser, ...updates };
    localStorage.setItem("mindease_user", JSON.stringify(updated));
    setUser(updated);
  };

  return { user, isLoading, login, logout, updateUser };
}
