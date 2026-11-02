import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

export interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeChatId: string | null;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  setActiveChatId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "dark",
  sidebarOpen: true,
  rightSidebarOpen: true,
  activeChatId: null,

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setActiveChatId: (id) => set({ activeChatId: id ? id.trim() : null }),
}));
