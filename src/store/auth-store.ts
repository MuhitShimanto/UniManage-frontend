import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/api";
import { clearAuthTokens, setAuthTokens } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  studentCode?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setSession: (user, accessToken, refreshToken) => {
        setAuthTokens(accessToken, refreshToken, user.role);
        set({ user, isAuthenticated: true });
      },
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      logout: () => {
        clearAuthTokens();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "unimanage-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
