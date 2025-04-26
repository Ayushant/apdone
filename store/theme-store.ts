import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeStore {
  theme: "light" | "dark" | null;
  setTheme: (theme: "light" | "dark" | null) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: null,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);