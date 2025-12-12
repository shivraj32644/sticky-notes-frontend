# Architecture & Project Structure Guide

## Overview

This is a **multi-window Electron application**, not a traditional SPA. Each window (Home, StickyNote) loads independently with its own renderer process.

## Recommended Structure

```
src/
├── main/                    # Electron Main Process (Node.js)
│   ├── main.ts             # App entry point
│   ├── windows/            # Window management
│   │   ├── homeWindow.ts
│   │   └── stickyNoteWindow.ts
│   ├── ipc/                # IPC handlers
│   │   └── index.ts
│   └── data/               # Data persistence
│       └── storage.ts
│
├── renderer/               # Renderer Process (React/UI)
│   ├── windows/            # Window-specific entry points
│   │   ├── home/           # Home window module
│   │   │   ├── HomeWindow.tsx    # Main component
│   │   │   ├── components/       # Home-specific components
│   │   │   ├── hooks/            # Home-specific hooks
│   │   │   └── utils/            # Home-specific utils
│   │   │
│   │   └── sticky-note/     # Sticky Note window module
│   │       ├── StickyNoteWindow.tsx  # Main component
│   │       ├── components/          # Sticky note components
│   │       ├── hooks/               # Sticky note hooks
│   │       └── utils/               # Sticky note utils
│   │
│   ├── shared/             # Shared renderer code
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Shared React hooks
│   │   ├── utils/          # Shared utilities
│   │   └── constants/      # Shared constants
│   │
│   └── App.tsx             # Router/dispatcher (determines which window to show)
│
├── shared/                 # Shared types & constants (used by both main & renderer)
│   ├── types.ts
│   └── constants.ts
│
└── lib/                    # Core libraries
    ├── store/              # State management (Zustand)
    └── utils/              # Core utilities
```

## Key Principles

### 1. **Feature-Based Modules (Not Page-Based)**

- Each window type is a **module** (home, sticky-note)
- Modules are self-contained with their own components, hooks, and utils
- No need for traditional routing libraries (React Router)

### 2. **Window = Module**

- `home/` module → Home window
- `sticky-note/` module → Sticky Note window
- Each module has its own entry component

### 3. **Hash-Based Routing (Simple)**

- Use hash routing (`#/home`, `#/sticky/:id`) for window content
- Each window loads with a hash, App.tsx dispatches to the right component
- No complex routing needed since windows are separate

### 4. **Separation of Concerns**

- `src/main/` → Electron main process (Node.js)
- `src/renderer/` → React UI code
- `src/shared/` → Types/constants used by both

## Why This Structure?

### ✅ Advantages:

1. **Clear separation** between main and renderer processes
2. **Feature-based** organization makes code easy to find
3. **Scalable** - easy to add new window types
4. **No routing complexity** - each window is independent
5. **Shared code** is clearly separated

### ❌ Avoid:

- Traditional SPA routing (React Router) - unnecessary for multi-window apps
- Mixing pages/ and modules/ - causes confusion
- Deep nesting - keep it flat and organized

## Migration Plan

1. **Move modules to renderer/windows/**

   - `modules/home/` → `renderer/windows/home/`
   - Create `renderer/windows/sticky-note/` for sticky notes

2. **Create shared renderer components**

   - Move reusable components to `renderer/shared/components/`

3. **Update imports**

   - Update all import paths
   - Update App.tsx routing

4. **Remove empty pages/**
   - Delete `src/pages/` (not needed)

## File Naming Conventions

- **Components**: PascalCase (e.g., `StickyNoteWindow.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useStickyNote.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`)
- **Types**: PascalCase interfaces (e.g., `Group`, `TodoItem`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `IPC_CHANNELS`)
