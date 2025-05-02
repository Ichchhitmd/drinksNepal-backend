import authService from "@/config/services/auth/authService";
import { User } from "@/types/types";
import Cookies from "js-cookie";
import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (
    email: string,
    password: string,
    setisAuthenticated: Dispatch<SetStateAction<boolean>>
  ) => Promise<void>;
  logout: () => void;
  authenticate: (
    accessToken: string,
    setisAuthenticated: Dispatch<SetStateAction<boolean>>
  ) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (
    email: string,
    password: string,
    setisAuthenticated: Dispatch<SetStateAction<boolean>>
  ) => {
    const response = await authService.loginAdmin(email, password);
    if (response?.status === 200) {
      Cookies.set("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      set({ isAuthenticated: true, user: response.data.user });
      setisAuthenticated(true);
    }
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
  authenticate: async (
    accessToken: string,
    setisAuthenticated: Dispatch<SetStateAction<boolean>>
  ) => {
    const response = await authService.authenticate(accessToken);
    if (response?.status === 200) {
      set({ isAuthenticated: true, user: response?.data });
      setisAuthenticated(true);
    }
  },
}));
