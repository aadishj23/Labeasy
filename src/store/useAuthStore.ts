import { create } from "zustand";

type AccountType = "user" | "lab" | "doctor" | "insurance" | null;

interface AuthState {
  isLoggedIn: boolean;
  ready: boolean; // true once we've checked the session at least once
  name: string | null;
  type: AccountType;
  setAuth: (data: { name: string | null; type: AccountType }) => void;
  clear: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  ready: false,
  name: null,
  type: null,
  setAuth: ({ name, type }) =>
    set({ isLoggedIn: true, name, type, ready: true }),
  clear: () => set({ isLoggedIn: false, name: null, type: null, ready: true }),
  refresh: async () => {
    try {
      const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        set({ isLoggedIn: true, name: data.name, type: data.type, ready: true });
      } else {
        set({ isLoggedIn: false, name: null, type: null, ready: true });
      }
    } catch {
      set({ isLoggedIn: false, name: null, type: null, ready: true });
    }
  },
}));
