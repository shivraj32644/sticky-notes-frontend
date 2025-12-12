export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  timerDuration?: number; // in minutes
  remainingTime?: number; // in seconds
  isTimerRunning?: boolean;
  description?: string; // Optional description
  isExpanded?: boolean; // UI state for description visibility
}

export interface DayContent {
  notes: string; // HTML string for rich text
  todos: Todo[];
}

export type Theme = "yellow" | "blue" | "green" | "dark" | "purple" | "pink";

export interface StickyGroup {
  id: string;
  title: string;
  theme: Theme;
  x: number;
  y: number;
  width: number;
  height: number;
  isAlwaysVisible: boolean; // Simulating "Always on Top" via Z-Index
  isOpen: boolean;
  lastSelectedDate: string; // ISO Date string YYYY-MM-DD
  content: Record<string, DayContent>; // Key is YYYY-MM-DD
  viewMode: "date" | "forever"; // Toggle between Date view and Forever view
  foreverContent: DayContent; // Storage for forever tasks/notes
  isTasksExpanded?: boolean;
  isNotesExpanded?: boolean;
}

export interface AppState {
  groups: StickyGroup[];
}

export const THEMES: Record<
  Theme,
  { bg: string; header: string; text: string; accent: string }
> = {
  yellow: {
    bg: "bg-yellow-50",
    header: "bg-yellow-200",
    text: "text-yellow-900",
    accent: "text-yellow-600",
  },
  blue: {
    bg: "bg-blue-50",
    header: "bg-blue-200",
    text: "text-blue-900",
    accent: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    header: "bg-green-200",
    text: "text-green-900",
    accent: "text-green-600",
  },
  pink: {
    bg: "bg-pink-50",
    header: "bg-pink-200",
    text: "text-pink-900",
    accent: "text-pink-600",
  },
  purple: {
    bg: "bg-purple-50",
    header: "bg-purple-200",
    text: "text-purple-900",
    accent: "text-purple-600",
  },
  dark: {
    bg: "bg-gray-800",
    header: "bg-gray-700",
    text: "text-gray-100",
    accent: "text-gray-400",
  },
};
