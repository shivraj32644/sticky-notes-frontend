export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO
  completedAt?: string; // ISO
}

export interface DayContent {
  date: string; // ISO date (YYYY-MM-DD, no time)
  notes: string; // serialized rich text or plain text
  todos: TodoItem[];
}

export interface Group {
  id: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  colorTheme?: string; // optional for future theming
  visibilityMode: "alwaysOnTop" | "standard"; // default "standard"
  lastViewedDate?: string; // ISO - placeholder for date module
  stats?: { completedDays?: number; streak?: number }; // placeholder for stats
  dayContents?: Record<string, DayContent>; // key: YYYY-MM-DD, value: DayContent
}

export interface StickyNoteWindowProps {
  groupId: string;
  alwaysOnTop?: boolean;
}
