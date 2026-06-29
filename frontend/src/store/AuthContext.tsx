import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getProfile as apiGetProfile } from "../services/api";
import type { ApiUser } from "../services/api";
import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";

type AuthContextType = {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (body: Record<string, string>) => Promise<void>;
  register: (body: Record<string, string>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("bbooks_token");
      if (!token) {
        useCartStore.getState().init(false);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiGetProfile();
        setUser(profile);
        await useCartStore.getState().init(true);
        await useWishlistStore.getState().fetchWishlist();
      } catch (err) {
        console.error("Failed to load user profile, token might be expired", err);
        localStorage.removeItem("bbooks_token");
        setUser(null);
        useCartStore.getState().init(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(body: Record<string, string>) {
    setIsLoading(true);
    try {
      const response = await apiLogin(body);
      localStorage.setItem("bbooks_token", response.data.token);
      setUser(response.data.user);
      await useCartStore.getState().init(true);
      await useWishlistStore.getState().fetchWishlist();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(body: Record<string, string>) {
    setIsLoading(true);
    try {
      const response = await apiRegister(body);
      localStorage.setItem("bbooks_token", response.data.token);
      setUser(response.data.user);
      await useCartStore.getState().init(true);
      await useWishlistStore.getState().fetchWishlist();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("bbooks_token");
    setUser(null);
    useCartStore.getState().init(false);
    useWishlistStore.getState().clearWishlist();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
