import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
}

// Derive the initial logged-in state from the persisted token (client-only).
const getInitialLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: getInitialLoggedIn(),
  setLoggedIn: (value) => set({ isLoggedIn: !!value }),
}));
