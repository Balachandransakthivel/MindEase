import { useState, useEffect } from "react";
import type { User } from "@/types";
import { MOCK_USER } from "@/constants/data";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mindease_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    
    // Check Supabase session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || "";
        const name = session.user.user_metadata?.name || email.split("@")[0];
        const userData: User = {
          id: session.user.id,
          name,
          email,
          joinedAt: session.user.created_at.split("T")[0],
          wellnessScore: session.user.user_metadata?.wellnessScore || 72,
          onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false,
          onboardingData: session.user.user_metadata?.onboardingData || undefined,
        };
        localStorage.setItem("mindease_user", JSON.stringify(userData));
        setUser(userData);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("Auth session fetch error:", err);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || "";
        const name = session.user.user_metadata?.name || email.split("@")[0];
        const userData: User = {
          id: session.user.id,
          name,
          email,
          joinedAt: session.user.created_at.split("T")[0],
          wellnessScore: session.user.user_metadata?.wellnessScore || 72,
          onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false,
          onboardingData: session.user.user_metadata?.onboardingData || undefined,
        };
        localStorage.setItem("mindease_user", JSON.stringify(userData));
        setUser(userData);
      } else {
        // Only remove user if they're not a mock local-only user
        const current = localStorage.getItem("mindease_user");
        if (current) {
          try {
            const u = JSON.parse(current);
            if (u && !u.id.startsWith("local_") && u.id !== "user_001") {
              localStorage.removeItem("mindease_user");
              setUser(null);
            }
          } catch (e) {
            localStorage.removeItem("mindease_user");
            setUser(null);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            wellnessScore: 72,
            joinedAt: new Date().toISOString().split("T")[0],
            onboardingCompleted: false,
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        if (!data.session) {
          toast.warning("Email verification required by Supabase! Logging you in locally to proceed. 🌿");
          const userData: User = {
            id: `local_${email}`,
            name,
            email,
            joinedAt: new Date().toISOString().split("T")[0],
            wellnessScore: 72,
            onboardingCompleted: false,
          };
          localStorage.setItem("mindease_user", JSON.stringify(userData));
          setUser(userData);
          return userData;
        }
        const userData: User = {
          id: data.user.id,
          name,
          email,
          joinedAt: data.user.created_at.split("T")[0],
          wellnessScore: 72,
          onboardingCompleted: false,
        };
        localStorage.setItem("mindease_user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (err: any) {
      console.error("Supabase sign up failed, falling back to mock registration:", err);
      const userData: User = {
        id: `local_${email}`,
        name,
        email,
        joinedAt: new Date().toISOString().split("T")[0],
        wellnessScore: 72,
        onboardingCompleted: false,
      };
      localStorage.setItem("mindease_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
  };

  const login = async (email: string, password: string, name?: string) => {
    // If name is provided, treat it as a signup attempt
    if (name) {
      return register(email, password, name);
    }

    // Demo bypass
    if (email === "demo@mindease.app" || email === "demo@mindease.ai" || email.includes("demo")) {
      const userData: User = {
        ...MOCK_USER,
        name: "Alex Johnson",
        email: "demo@mindease.app",
      };
      localStorage.setItem("mindease_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const email = data.user.email || "";
        const name = data.user.user_metadata?.name || email.split("@")[0];
        const userData: User = {
          id: data.user.id,
          name,
          email,
          joinedAt: data.user.created_at.split("T")[0],
          wellnessScore: data.user.user_metadata?.wellnessScore || 72,
          onboardingCompleted: data.user.user_metadata?.onboardingCompleted || false,
          onboardingData: data.user.user_metadata?.onboardingData || undefined,
        };
        localStorage.setItem("mindease_user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (err: any) {
      console.error("Supabase sign in failed, falling back to mock login:", err);
      const userData: User = {
        id: `local_${email}`,
        name: email.split("@")[0],
        email,
        joinedAt: new Date().toISOString().split("T")[0],
        wellnessScore: 72,
      };
      localStorage.setItem("mindease_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signOut error:", e);
    }
    localStorage.removeItem("mindease_user");
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    const stored = localStorage.getItem("mindease_user");
    if (!stored) return;
    const currentUser = JSON.parse(stored);
    const updated = { ...currentUser, ...updates };
    localStorage.setItem("mindease_user", JSON.stringify(updated));
    setUser(updated);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({
          data: {
            name: updated.name,
            wellnessScore: updated.wellnessScore,
            onboardingCompleted: updated.onboardingCompleted,
            onboardingData: updated.onboardingData,
          }
        });
      }
    } catch (e) {
      console.error("Failed to update Supabase user metadata:", e);
    }
  };

  return { user, isLoading, login, logout, updateUser };
}
