import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

export type UserRole = "customer" | "business" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface BusinessData {
  businessName: string;
  businessAddress?: string;
  postcode?: string;
  city?: string;
  phone?: string;
}

// Legacy support
interface RetailerData extends BusinessData {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, options?: { redirect?: string }) => Promise<void>;
  signup: (username: string, email: string, password: string, role: UserRole, businessData?: BusinessData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isBusiness: boolean; // Formerly isRetailer
  isRetailer?: boolean; // Legacy support
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string, options?: { redirect?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    setUser(data.data);

    const redirectPath = options?.redirect?.startsWith("/") ? options.redirect : null;

    if (redirectPath) {
      setLocation(redirectPath);
    } else if (data.data.role === "business") {
      setLocation("/business/dashboard");
    } else if (data.data.role === "admin") {
      setLocation("/admin/dashboard");
    } else {
      setLocation("/");
    }
  };

  const signup = async (username: string, email: string, password: string, role: UserRole = "customer", businessData?: BusinessData) => {
    const body: any = { username, email, password, role };
    if (role === "business" && businessData) {
      body.businessData = businessData;
    }

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Signup failed");
    }

    setUser(data.data);
    
    // Redirect based on role
    if (data.data.role === "business") {
      // New business signups go to onboarding wizard
      setLocation("/business/onboarding");
    } else if (data.data.role === "admin") {
      setLocation("/admin/dashboard");
    } else {
      setLocation("/");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setLocation("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isCustomer: user?.role === "customer",
        isBusiness: user?.role === "business",
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

