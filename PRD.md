# ✅ Product Prompt: Group & Date-Based Floating Sticky Notes Planner

**Build a cross-platform Electron desktop app (Windows, macOS, Linux) that lets users create multiple floating sticky-note windows, each representing a project or group, with past, present, and future date-wise notes and todos. The experience must stay minimal, intuitive, and non-cluttered while providing strong planning and motivation features.**

---

## **Core Requirements**

### **Floating Resizable Sticky Notes Window**

- A sticky-note style window that the user can drag anywhere on the screen.

- The window must be resizable by dragging edges (width + height).

- The UI should stay lightweight, minimal, and distraction-free.

---

### **Visibility Modes**

Include a visibility toggle or dropdown with two modes:

### **• Always Visible Mode**

- The sticky note window remains on top of all applications at all times.

- Even when the user clicks outside or focuses another app (e.g., VS Code), the sticky note stays visible.

- Designed for users who want persistent reminders without needing Alt+Tab.

### **• Standard Visible Mode**

- Default system behavior: the note loses focus and moves behind maximized apps when the user clicks outside.

---

## 1. Sticky Notes as Groups (Projects / Categories)

- Users can create **multiple sticky notes**, each mapped to a **group**:

\* “Project A”

\* “Client X”

\* “Personal Life”

\* “Ideas”, etc.

- Each sticky note includes:

\* **Group title**

\* Its own notes and todos, organized by date

\* Its own **visibility mode** (Always Visible / Standard)

- Users can open multiple sticky windows simultaneously, each floating independently.

---

## 2. Date-Wise Notes & Todos (Past, Today, Future)

Inside each group sticky note:

- Provide a **date selector area** that controls which day’s content is shown.

- For each selected date, the sticky note shows:

\* Notes for that date

\* Todos for that date

\* Progress for that date

**Support full timeline navigation:**

- Today, Yesterday, Tomorrow quick-jump buttons.

- Ability to jump to **any future or past date** and:

\* Add notes (e.g., meeting prep for next week)

\* Add todos (e.g., “Call client on 20 Dec”)

\* Edit or review previous days.

When the actual day comes, the user sees the pre-planned notes and todos for that date directly in that group’s sticky note.

---

## 3. Calendar UI for Planning (Mini Google Calendar Style)

- Add a small **calendar icon** in each sticky note header.

- On click, open a **compact calendar overlay** (month view) that:

\* Highlights today.

\* Allows navigation to past and future months.

\* Lets users click any date to:

\* View existing notes/todos.

\* Add or edit content for that date.

- Calendar must be **compact and dismissible**, not a full-page app, to preserve the sticky-note feel.

- Use subtle markers on dates (dots or tiny bars) to indicate:

\* Existing todos

\* Completed days

\* Future planned tasks.

---

## 4. Clean, Non-Cluttered UI/UX

The sticky note stays visually simple and focused:

### A. Header (Top Bar)

- Group title.

- Date display with left/right arrows (for previous/next day).

- Calendar icon (opens calendar overlay).

- Visibility dropdown (Always Visible / Standard).

- Minimal “+” button for quick add (new todo or note).

- Three-dot menu for secondary actions (delete group, theme, etc.).

### B. Date Strip / Quick Navigation

- Under the header, a thin strip:

\* “Yesterday · Today · Tomorrow” quick chips.

\* Optionally, next key dates (e.g., “Mon 15”, “Tue 16”).

- Tapping a chip updates the content area without reloading the window.

### C. Content Area (Notes + Todos)

- Single scrollable area combining:

\* Notes (rich text)

\* Todos list for that date

- Clearly separated “Notes” and “Todos” sections using simple labels or subtle dividers.

- Everything auto-saves.

---

## 5. Notes + To-Dos (Per Date, Per Group)

### Notes

- Rich text formatting: bold, italic, underline, bullet lists.

- Lightweight editor suitable for quick thoughts and meeting notes.

### To-Dos

- Each todo has:

\* Checkbox

\* Text

- On checkbox click:

\* Apply strikethrough to text.

\* Trigger a **micro-celebration** (confetti burst, animated check, or glow).

\* Show a **short motivational message**.

Todos are always scoped to:

- The current **group** AND

- The currently selected **date**.

---

## 6. Progress & Motivation (Daily + Group-Level)

### Daily Progress (Per Date)

- Show a small progress bar or ring:

\* % of todos completed for that date.

\* Example: 3 of 5 todos done → 60% complete.

- Place this near the date area to keep context obvious.

### Group-Level Progress (Lightweight)

- In the group header or calendar:

\* Subtle indicators such as:

\* “3 productive days this week”

\* “5-day streak”

- No heavy dashboards; everything remains compact and minimal.

### Motivation & Rewards

Add motivational micro-experiences such as:

- Confetti bursts or animated check when a todo is completed.

- A small popup/banner with a short message along with  Confetti bursts animation Short messages:

\* “Nice, one more done!”

\* “You’re on a roll!”

\* “Future you will thank you for this.”

- Optional small **badges** or icons for:

\* Completing all todos for a day.

\* Maintaining a streak across days.

---

## 7. Visibility Modes (Per Sticky Note)

Each sticky note supports:

### Always Visible Mode

- Window always remains on top of other apps.

- Intended for users who want constant visibility while coding, designing, etc.

### Standard Visible Mode

- Behaves like a normal window.

- Moves behind other apps when unfocused.

The visibility mode is easily switchable via a simple toggle/dropdown in the header.

### **• Mood-Boosting Visuals**

- Allow users to pick from color themes like:

\* Calm blue

\* Energetic yellow

\* Focus green

\* Dark mode

- Themes visually reinforce productivity.

---

## 8. Overall UX Goal

**Create a planner-like sticky note system that:**

- Feels as simple as a physical sticky note,

- Organizes work per **group** and **date**,

- Enables **future planning** without friction (like a mini calendar planner),

- Keeps users **motivated** via progress feedback and micro-rewards,

- Never overwhelms with complexity or clutter.

The app should feel like a **smart, friendly desk buddy**—always there, always understandable at a glance.

---

## 9. Navigation Flow (High-Level UX Map)

Design the app so navigation is predictable and intuitive:

### 9.1 App Launch

1. User opens the app.

2. Show a **Home view** (optional but recommended) with:

\* List of existing groups (sticky notes) with titles.

\* Search bar to filter groups.

\* “+ New Group Note” button.

3. From Home, user can:

\* Open any existing sticky note.

\* Create a new sticky note (group).

### 9.2 Creating a New Group Sticky Note

1. User clicks “+ New Group Note”.

2. Prompt for **group title** (e.g., “Project A”).

3. Open a new floating sticky window:

\* Today’s date pre-selected.

\* Empty Notes + Todos sections.

### 9.3 Switching Dates (Inside a Group)

1. From a sticky note:

\* User taps **left/right arrows** to move to previous/next day, **or**

\* Taps “Today / Tomorrow / Yesterday” quick chips, **or**

\* Clicks the **calendar icon** to pick any date.

2. On date change:

\* Notes + Todos update for that exact date.

\* Daily progress indicator updates accordingly.

### 9.4 Adding Future Notes/Tasks

1. User opens calendar overlay from sticky note.

2. Selects any **future date** (e.g., next week).

3. Content area switches to that future date.

4. User adds notes/todos as usual.

5. When that date arrives:

\* Opening the group sticky note on that day displays the pre-planned content.

### 9.5 Tracking Progress

1. As user checks off todos:

\* Progress bar updates live.

\* Micro-celebrations trigger.

2. Calendar view uses small markers on dates:

\* More completed tasks → stronger marker or color intensity.

### 9.6 Managing Visibility

1. In the sticky note header, user opens the **visibility dropdown**.

2. Choose:

\* **Always Visible** → note stays on top of all apps.

\* **Standard** → behaves like normal window.

### 9.7 Managing Multiple Groups

1. From Home or system tray, user can:

\* Open/close specific group notes.

\* Rename or delete a group.

2. Each open sticky note remembers:

\* Last viewed date.

\* Screen position.

\* Visibility mode.
