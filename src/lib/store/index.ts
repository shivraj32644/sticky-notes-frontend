import { create } from "zustand";
import { Group } from "../../shared/types";

interface AppState {
  // Groups state
  groups: Group[];
  searchQuery: string;

  // Group actions
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (id: string) => void;

  // Search actions
  setSearchQuery: (query: string) => void;

  // Computed getter for filtered groups
  getFilteredGroups: () => Group[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  groups: [],
  searchQuery: "",

  // Group actions
  setGroups: (groups) => set({ groups }),

  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  updateGroup: (updatedGroup) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === updatedGroup.id ? updatedGroup : g
      ),
    })),

  deleteGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Computed getter for filtered groups
  getFilteredGroups: () => {
    const { groups, searchQuery } = get();
    if (!searchQuery.trim()) {
      return groups;
    }
    const query = searchQuery.toLowerCase();
    return groups.filter((g) => g.title.toLowerCase().includes(query));
  },
}));
