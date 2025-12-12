export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string; // ISO
  completedAt?: string; // ISO
  timerDuration?: number; // in minutes
  remainingTime?: number; // in seconds
  isTimerRunning?: boolean;
  description?: string; // Optional description
  isExpanded?: boolean; // UI state for description visibility
}

export interface DayContent {
  date: string; // ISO date (YYYY-MM-DD, no time)
  notes: string; // serialized rich text or plain text (HTML)
  todos: TodoItem[];
}

export type Theme = "yellow" | "blue" | "green" | "dark" | "purple" | "pink";

export interface Group {
  id: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  theme?: Theme; // Color theme
  colorTheme?: string; // optional for future theming (deprecated, use theme)
  visibilityMode: "alwaysOnTop" | "standard"; // default "standard"
  lastViewedDate?: string; // ISO - placeholder for date module
  lastSelectedDate?: string; // YYYY-MM-DD format
  stats?: { completedDays?: number; streak?: number }; // placeholder for stats
  dayContents?: Record<string, DayContent>; // key: YYYY-MM-DD, value: DayContent
  // Window position and size
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // View mode and forever content
  viewMode?: "date" | "forever"; // Toggle between Date view and Forever view
  foreverContent?: DayContent; // Storage for forever tasks/notes
  isTasksExpanded?: boolean;
  isNotesExpanded?: boolean;
}

export interface StickyNoteWindowProps {
  groupId: string;
  alwaysOnTop?: boolean;
}
