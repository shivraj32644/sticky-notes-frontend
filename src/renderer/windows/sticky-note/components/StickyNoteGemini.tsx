import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Calendar as CalendarIcon,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  GripHorizontal,
  Pin,
  Clock,
  Play,
  Pause,
  StopCircle,
  GripVertical,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Infinity,
  CalendarArrowUp,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";

import {
  formatDateKey,
  parseDateKey,
  addDays,
  formatDisplayDate,
  getTodayKey,
  triggerConfetti,
  getRandomQuote,
  formatTime,
} from "../../home/utils/index";
import { RichTextEditor } from "../components/RichTextEditor";
import { CalendarView } from "../components/CalendarView";
import {
  DayContent,
  StickyGroup,
  THEMES,
  Theme,
  Todo,
} from "../../home/types/index";
import { cn } from "../../../../lib/utils";

interface StickyNoteProps {
  group: StickyGroup;
  onUpdate: (updatedGroup: StickyGroup) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  zIndex: number;
}

export const StickyNoteGemini: React.FC<StickyNoteProps> = ({
  group,
  onUpdate,
  onClose,
  onFocus,
  zIndex,
}) => {
  const theme = THEMES[group.theme];
  // Ensure we have defaults if data is old
  const viewMode = group.viewMode || "date";
  const foreverContent = group.foreverContent || { notes: "", todos: [] };
  const isTasksExpanded = group.isTasksExpanded !== false; // Default true
  const isNotesExpanded = group.isNotesExpanded !== false; // Default true

  const [currentDateKey, setCurrentDateKey] = useState(
    group.lastSelectedDate || getTodayKey()
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Dragging Window State
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Resizing State
  const [resizeStart, setResizeStart] = useState<{
    w: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);
  const [editingDescriptionId, setEditingDescriptionId] = useState<
    string | null
  >(null);

  // Move Menu State
  const [movingTodoId, setMovingTodoId] = useState<string | null>(null);
  const [movingNotes, setMovingNotes] = useState(false);
  const [showMoveCalendar, setShowMoveCalendar] = useState(false);

  // Drag & Drop Tasks State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const todayKey = getTodayKey();

  // DETERMINE CONTENT BASED ON VIEW MODE
  const isForever = viewMode === "forever";
  const currentContent: DayContent = isForever
    ? foreverContent
    : group.content[currentDateKey] || { notes: "", todos: [] };

  const totalTodos = currentContent.todos.length;
  const completedTodos = currentContent.todos.filter((t) => t.completed).length;
  const progress =
    totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  // Check for active timer
  const activeTimerTodo = currentContent.todos.find((t) => t.isTimerRunning);

  // Sync date selection back to group state
  useEffect(() => {
    if (currentDateKey !== group.lastSelectedDate) {
      onUpdate({ ...group, lastSelectedDate: currentDateKey });
    }
  }, [currentDateKey]);

  // Timer Interval Logic
  useEffect(() => {
    let interval: number;
    if (activeTimerTodo && activeTimerTodo.isTimerRunning) {
      interval = window.setInterval(() => {
        const current = activeTimerTodo.remainingTime || 0;
        if (current <= 0) {
          // Timer finished
          clearInterval(interval);
          const newTodos = currentContent.todos.map((t) =>
            t.id === activeTimerTodo.id
              ? { ...t, isTimerRunning: false, remainingTime: 0 }
              : t
          );
          updateContent({ todos: newTodos });
          triggerConfetti(
            group.x + group.width / 2,
            group.y + group.height / 2
          );
          setToastMessage("Timer Finished! Great Focus!");
          setTimeout(() => setToastMessage(null), 3000);
        } else {
          // Decrement
          const newTodos = currentContent.todos.map((t) =>
            t.id === activeTimerTodo.id
              ? { ...t, remainingTime: current - 1 }
              : t
          );
          updateContent({ todos: newTodos });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerTodo, currentContent.todos, foreverContent]);

  // Window Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    onFocus(group.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: group.x, y: group.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStart && initialPos) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onUpdate({ ...group, x: initialPos.x + dx, y: initialPos.y + dy });
    } else if (resizeStart) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      onUpdate({
        ...group,
        width: Math.max(280, resizeStart.w + dx),
        height: Math.max(300, resizeStart.h + dy),
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setInitialPos(null);
    setResizeStart(null);
    setIsResizing(false);
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      w: group.width,
      h: group.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    if (dragStart || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragStart, isResizing]);

  // --- CONTENT UPDATERS ---

  const updateContent = (updates: Partial<DayContent>) => {
    if (isForever) {
      onUpdate({ ...group, foreverContent: { ...foreverContent, ...updates } });
    } else {
      const newContent = { ...group.content };
      newContent[currentDateKey] = { ...currentContent, ...updates };
      onUpdate({ ...group, content: newContent });
    }
  };

  const setViewMode = (mode: "date" | "forever") => {
    onUpdate({ ...group, viewMode: mode });
  };

  const toggleSection = (section: "tasks" | "notes") => {
    if (section === "tasks") {
      onUpdate({ ...group, isTasksExpanded: !isTasksExpanded });
    } else {
      onUpdate({ ...group, isNotesExpanded: !isNotesExpanded });
    }
  };

  // --- MOVING LOGIC ---

  const moveTodo = (todoId: string, targetDateKey: string | "forever") => {
    // 1. Find todo
    const todoToMove = currentContent.todos.find((t) => t.id === todoId);
    if (!todoToMove) return;

    // 2. Remove from current
    const newCurrentTodos = currentContent.todos.filter((t) => t.id !== todoId);
    updateContent({ todos: newCurrentTodos });

    // 3. Add to target
    if (targetDateKey === "forever") {
      const targetTodos = group.foreverContent?.todos || [];
      onUpdate({
        ...group,
        content: isForever
          ? group.content
          : {
              ...group.content,
              [currentDateKey]: { ...currentContent, todos: newCurrentTodos },
            },
        foreverContent: {
          ...group.foreverContent,
          todos: [...targetTodos, todoToMove],
        },
      });
    } else {
      // Target is a date
      const targetContent = group.content[targetDateKey] || {
        notes: "",
        todos: [],
      };
      const newGroupContent = { ...group.content };

      // Update source if source was date-based
      if (!isForever) {
        newGroupContent[currentDateKey] = {
          ...currentContent,
          todos: newCurrentTodos,
        };
      }

      // Update target
      newGroupContent[targetDateKey] = {
        ...targetContent,
        todos: [...targetContent.todos, todoToMove],
      };

      onUpdate({
        ...group,
        content: newGroupContent,
        foreverContent: isForever
          ? { ...foreverContent, todos: newCurrentTodos }
          : group.foreverContent,
      });
    }

    setMovingTodoId(null);
    setShowMoveCalendar(false);
    setToastMessage("Task moved!");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const moveNotes = (targetDateKey: string) => {
    if (!currentContent.notes.trim()) return;

    const targetContent = group.content[targetDateKey] || {
      notes: "",
      todos: [],
    };
    const sourceNotes = currentContent.notes;
    const combinedNotes = targetContent.notes
      ? `${targetContent.notes}<br><br>${sourceNotes}`
      : sourceNotes;

    // Clear source (current)
    updateContent({ notes: "" });

    // Update target
    const newGroupContent = { ...group.content };

    // If we are currently in date mode, we just cleared it via updateContent, but we need to ensure the batch update works
    // Actually updateContent works on state, so we need to be careful not to overwrite.
    // Let's construct the full update here manually for safety.

    if (isForever) {
      // Source is forever, Target is date
      newGroupContent[targetDateKey] = {
        ...targetContent,
        notes: combinedNotes,
      };
      onUpdate({
        ...group,
        content: newGroupContent,
        foreverContent: { ...foreverContent, notes: "" },
      });
    } else {
      // Source is date, Target is date
      newGroupContent[currentDateKey] = { ...currentContent, notes: "" }; // Clear source
      newGroupContent[targetDateKey] = {
        ...targetContent,
        notes: combinedNotes,
      };
      onUpdate({ ...group, content: newGroupContent });
    }

    setMovingNotes(false);
    setShowMoveCalendar(false);
    setToastMessage("Notes moved!");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // --- TODO OPERATIONS ---

  const addTodo = (text: string) => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      timerDuration: 25,
      remainingTime: 25 * 60,
    };
    updateContent({ todos: [...currentContent.todos, newTodo] });
  };

  const toggleTodo = (todoId: string, event: React.MouseEvent) => {
    const newTodos = currentContent.todos.map((t) => {
      if (t.id === todoId) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          triggerConfetti(event.clientX, event.clientY);
          setToastMessage(getRandomQuote());
          setTimeout(() => setToastMessage(null), 3000);
          return { ...t, completed: isNowCompleted, isTimerRunning: false };
        }
        return { ...t, completed: isNowCompleted };
      }
      return t;
    });
    updateContent({ todos: newTodos });
  };

  const deleteTodo = (todoId: string) => {
    updateContent({
      todos: currentContent.todos.filter((t) => t.id !== todoId),
    });
  };

  // --- TIMER & DESCRIPTION ---
  const updateTodoTimer = (todoId: string, durationMin: number) => {
    const newTodos = currentContent.todos.map((t) =>
      t.id === todoId
        ? { ...t, timerDuration: durationMin, remainingTime: durationMin * 60 }
        : t
    );
    updateContent({ todos: newTodos });
  };

  const toggleTimer = (todoId: string) => {
    const newTodos = currentContent.todos.map((t) => {
      if (t.id === todoId) {
        const isRunning = !t.isTimerRunning;
        let remaining = t.remainingTime;
        if (remaining === undefined || remaining === 0)
          remaining = (t.timerDuration || 25) * 60;
        return { ...t, isTimerRunning: isRunning, remainingTime: remaining };
      }
      return { ...t, isTimerRunning: false };
    });
    updateContent({ todos: newTodos });
    setEditingTimerId(null);
  };

  const stopTimer = (todoId: string) => {
    const newTodos = currentContent.todos.map((t) =>
      t.id === todoId
        ? {
            ...t,
            isTimerRunning: false,
            remainingTime: (t.timerDuration || 25) * 60,
          }
        : t
    );
    updateContent({ todos: newTodos });
  };

  const updateTodoDescription = (todoId: string, description: string) => {
    const newTodos = currentContent.todos.map((t) =>
      t.id === todoId ? { ...t, description, isExpanded: true } : t
    );
    updateContent({ todos: newTodos });
  };

  const toggleTodoExpansion = (todoId: string) => {
    const newTodos = currentContent.todos.map((t) =>
      t.id === todoId ? { ...t, isExpanded: !t.isExpanded } : t
    );
    updateContent({ todos: newTodos });
  };

  // --- DRAG & DROP ---
  const handleDragStart = (position: number) => {
    dragItem.current = position;
  };
  const handleDragEnter = (position: number) => {
    dragOverItem.current = position;
  };
  const handleDragEnd = () => {
    const dragIndex = dragItem.current;
    const hoverIndex = dragOverItem.current;
    if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
      const newTodos = [...currentContent.todos];
      const draggedItem = newTodos[dragIndex];
      newTodos.splice(dragIndex, 1);
      newTodos.splice(hoverIndex, 0, draggedItem);
      updateContent({ todos: newTodos });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // --- NAVIGATION ---
  const changeDay = (offset: number) => {
    const date = parseDateKey(currentDateKey);
    const newDate = addDays(date, offset);
    setCurrentDateKey(formatDateKey(newDate));
  };

  const jumpTo = (when: "today" | "yesterday" | "tomorrow") => {
    const today = new Date();
    if (when === "today") setCurrentDateKey(formatDateKey(today));
    if (when === "yesterday")
      setCurrentDateKey(formatDateKey(addDays(today, -1)));
    if (when === "tomorrow")
      setCurrentDateKey(formatDateKey(addDays(today, 1)));
  };

  const dateObj = parseDateKey(currentDateKey);
  const isToday = currentDateKey === todayKey;
  const displayDate = isToday ? "Today" : formatDisplayDate(dateObj);

  return (
    <div
      ref={windowRef}
      className={cn(
        "absolute rounded-xl shadow-2xl flex flex-col overflow-hidden transition-shadow duration-200 border border-black/5 ring-1 ring-black/5",
        group.isAlwaysVisible ? "z-[9999]" : "",
        theme.bg
      )}
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
        zIndex: group.isAlwaysVisible ? 9999 : zIndex,
        boxShadow: group.isAlwaysVisible
          ? "0 20px 50px rgba(0,0,0,0.2)"
          : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-medium z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div
        className={cn(
          "px-3 py-2 flex items-center justify-between shrink-0 select-none cursor-grab active:cursor-grabbing",
          theme.header
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <GripHorizontal size={14} className={cn("opacity-40", theme.text)} />
          <input
            type="text"
            value={group.title}
            onChange={(e) => onUpdate({ ...group, title: e.target.value })}
            className={cn(
              "bg-transparent font-bold text-sm outline-none truncate w-full no-drag",
              theme.text
            )}
          />
        </div>
        <div className="flex items-center gap-1 no-drag">
          {/* View Toggle */}
          <button
            onClick={() => setViewMode(isForever ? "date" : "forever")}
            className={cn(
              "p-1 rounded hover:bg-black/10 transition-colors flex items-center justify-center",
              isForever ? "bg-black/10" : ""
            )}
            title={isForever ? "Switch to Date View" : "Switch to Forever View"}
          >
            {isForever ? (
              <Infinity size={14} className={theme.text} />
            ) : (
              <CalendarIcon size={14} className={theme.text} />
            )}
          </button>

          <button
            onClick={() =>
              onUpdate({ ...group, isAlwaysVisible: !group.isAlwaysVisible })
            }
            className={cn(
              "p-1 rounded hover:bg-black/10 transition-colors",
              group.isAlwaysVisible ? "bg-black/10" : ""
            )}
            title="Always on top"
          >
            <Pin
              size={14}
              className={
                group.isAlwaysVisible ? "text-black fill-current" : theme.text
              }
            />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-black/10 relative"
          >
            <MoreHorizontal size={14} className={theme.text} />
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 p-1 w-32 z-50 text-xs text-gray-700 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 font-semibold text-gray-400 text-[10px] uppercase">
                  Theme
                </div>
                <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                  {(Object.keys(THEMES) as Theme[]).map((t) => (
                    <button
                      key={t}
                      className={cn(
                        "w-4 h-4 rounded-full border border-black/10",
                        THEMES[t].bg
                      )}
                      onClick={() => {
                        onUpdate({ ...group, theme: t });
                        setShowMenu(false);
                      }}
                    />
                  ))}
                </div>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  className="w-full text-left px-2 py-1 hover:bg-red-50 text-red-600 rounded"
                  onClick={() => onClose(group.id)}
                >
                  Delete Group
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Date Navigation Strip (Hidden in Forever Mode) */}
      {!isForever && (
        <div className="border-b border-black/5 bg-white/30 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 no-drag">
            <button
              onClick={() => changeDay(-1)}
              className={cn("p-0.5 rounded hover:bg-black/5", theme.text)}
            >
              <ChevronLeft size={16} />
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon size={14} className={theme.text} />
              <span
                className={cn(
                  "text-sm font-semibold min-w-[80px] text-center",
                  theme.text
                )}
              >
                {displayDate}
              </span>
            </div>
            <button
              onClick={() => changeDay(1)}
              className={cn("p-0.5 rounded hover:bg-black/5", theme.text)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-1 no-drag">
            <button
              onClick={() => jumpTo("yesterday")}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full border border-black/5 hover:bg-white/50 transition-colors",
                theme.text
              )}
            >
              Yest
            </button>
            <button
              onClick={() => jumpTo("today")}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full border border-black/5 hover:bg-white/50 transition-colors font-medium",
                theme.text
              )}
            >
              Today
            </button>
            <button
              onClick={() => jumpTo("tomorrow")}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full border border-black/5 hover:bg-white/50 transition-colors",
                theme.text
              )}
            >
              Tom
            </button>
          </div>
        </div>
      )}

      {/* Forever Banner */}
      {isForever && (
        <div className="border-b border-black/5 bg-white/30 backdrop-blur-sm px-3 py-1.5 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-2 opacity-70">
            <Infinity size={14} className={theme.text} />
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-widest",
                theme.text
              )}
            >
              Forever View
            </span>
          </div>
        </div>
      )}

      {/* Progress Line */}
      <div className="h-0.5 w-full bg-black/5">
        <div
          className="h-full bg-black/20 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Calendar Overlay */}
      {(showCalendar || showMoveCalendar) && (
        <div className="absolute top-[80px] left-4 z-50 no-drag">
          <CalendarView
            currentDateKey={showMoveCalendar ? currentDateKey : currentDateKey}
            onSelectDate={(date) => {
              if (showMoveCalendar) {
                if (movingTodoId) moveTodo(movingTodoId, date);
                if (movingNotes) moveNotes(date);
              } else {
                setCurrentDateKey(date);
              }
              setShowCalendar(false);
            }}
            onClose={() => {
              setShowCalendar(false);
              setShowMoveCalendar(false);
              setMovingTodoId(null);
              setMovingNotes(false);
            }}
            groupData={group.content}
            themeClass={theme.header}
          />
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowCalendar(false);
              setShowMoveCalendar(false);
              setMovingTodoId(null);
              setMovingNotes(false);
            }}
          ></div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 no-drag flex flex-col gap-4 relative">
        {/* FOCUS MODE OVERLAY */}
        {activeTimerTodo && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 backdrop-blur-md bg-white/90">
            <div className="mb-6">
              <div
                className={cn(
                  "text-xs font-bold uppercase tracking-widest opacity-50 mb-2",
                  theme.text
                )}
              >
                Current Focus
              </div>
              <h2 className={cn("text-xl font-bold leading-tight", theme.text)}>
                {activeTimerTodo.text}
              </h2>
            </div>

            <div
              className={cn(
                "text-6xl font-mono font-bold mb-8 tracking-tighter tabular-nums",
                theme.text
              )}
            >
              {formatTime(activeTimerTodo.remainingTime || 0)}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => stopTimer(activeTimerTodo.id)}
                className="p-3 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                title="Stop Timer"
              >
                <StopCircle size={24} />
              </button>
              <button
                onClick={() => toggleTimer(activeTimerTodo.id)}
                className="p-4 rounded-full bg-black text-white hover:bg-gray-800 transition-transform hover:scale-105 shadow-xl"
                title="Pause"
              >
                <Pause size={28} fill="currentColor" />
              </button>
              <button
                onClick={(e) => toggleTodo(activeTimerTodo.id, e)}
                className="p-3 rounded-full hover:bg-green-50 text-green-600 transition-colors"
                title="Complete Task"
              >
                <Check size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Todos Section */}
        <div
          className={cn(
            activeTimerTodo ? "blur-sm pointer-events-none opacity-50" : "",
            "flex flex-col",
            isTasksExpanded ? "" : "h-auto shrink-0"
          )}
        >
          <div
            className="flex items-center justify-between mb-2 group cursor-pointer select-none"
            onClick={() => toggleSection("tasks")}
          >
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "p-0.5 rounded hover:bg-black/10 transition-colors",
                  theme.text
                )}
              >
                {isTasksExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <h3
                className={cn(
                  "text-xs font-bold uppercase tracking-wider opacity-60",
                  theme.text
                )}
              >
                Tasks ({completedTodos}/{totalTodos})
              </h3>
            </div>
          </div>

          {isTasksExpanded && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {currentContent.todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={cn(
                    "group relative p-1 rounded-md transition-all",
                    dragItem.current === index
                      ? "opacity-50"
                      : "hover:bg-black/5"
                  )}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Main Row */}
                  <div className="flex items-start gap-2 text-sm relative">
                    <div className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity">
                      <GripVertical size={12} className={theme.text} />
                    </div>
                    <button
                      onClick={(e) => toggleTodo(todo.id, e)}
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        todo.completed
                          ? "bg-black border-black text-white"
                          : "border-black/20 hover:border-black/40 bg-white"
                      )}
                    >
                      {todo.completed && <Check size={10} />}
                    </button>

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-start gap-1">
                        <span
                          className={cn(
                            "flex-1 transition-all break-words leading-tight pt-[1px]",
                            theme.text,
                            todo.completed ? "line-through opacity-40" : ""
                          )}
                        >
                          {todo.text}
                        </span>
                        {todo.description && (
                          <button
                            onClick={() => toggleTodoExpansion(todo.id)}
                            className={cn(
                              "p-0.5 rounded hover:bg-black/10 transition-colors",
                              theme.text
                            )}
                          >
                            {todo.isExpanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {!todo.completed && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingDescriptionId(
                              editingDescriptionId === todo.id ? null : todo.id
                            );
                            setEditingTimerId(null);
                            setMovingTodoId(null);
                          }}
                          className={cn(
                            "p-0.5 transition-opacity rounded hover:bg-black/5 text-gray-400 hover:text-gray-600",
                            todo.description ? "text-gray-600" : ""
                          )}
                          title="Add/Edit Description"
                        >
                          <AlignLeft size={12} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTimerId(
                              editingTimerId === todo.id ? null : todo.id
                            );
                            setEditingDescriptionId(null);
                            setMovingTodoId(null);
                          }}
                          className={cn(
                            "p-0.5 transition-opacity rounded hover:bg-black/5",
                            todo.remainingTime !== undefined &&
                              todo.remainingTime <
                                (todo.timerDuration || 25) * 60
                              ? "opacity-100 text-blue-500"
                              : "text-gray-400 hover:text-gray-600"
                          )}
                          title="Timer / Focus Mode"
                        >
                          <Clock size={12} />
                        </button>

                        {/* MOVE TASK BUTTON */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              setMovingTodoId(
                                movingTodoId === todo.id ? null : todo.id
                              );
                              setEditingTimerId(null);
                              setEditingDescriptionId(null);
                            }}
                            className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-black/5"
                            title="Move Task"
                          >
                            <CornerDownRight size={12} />
                          </button>

                          {/* Move Menu */}
                          {movingTodoId === todo.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-100 p-1 w-36 flex flex-col animate-in fade-in zoom-in-95 cursor-auto">
                              <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase">
                                Move to...
                              </div>
                              <button
                                onClick={() =>
                                  moveTodo(
                                    todo.id,
                                    formatDateKey(addDays(new Date(), 1))
                                  )
                                }
                                className="text-left px-2 py-1.5 hover:bg-gray-100 text-xs rounded text-gray-700 flex items-center gap-2"
                              >
                                <CalendarArrowUp size={12} /> Tomorrow
                              </button>
                              <button
                                onClick={() =>
                                  moveTodo(
                                    todo.id,
                                    isForever ? getTodayKey() : "forever"
                                  )
                                }
                                className="text-left px-2 py-1.5 hover:bg-gray-100 text-xs rounded text-gray-700 flex items-center gap-2"
                              >
                                <Infinity size={12} />{" "}
                                {isForever ? "Today" : "Forever"}
                              </button>
                              <button
                                onClick={() => setShowMoveCalendar(true)}
                                className="text-left px-2 py-1.5 hover:bg-gray-100 text-xs rounded text-gray-700 flex items-center gap-2"
                              >
                                <CalendarIcon size={12} /> Pick Date...
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-0.5 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Task"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Popups for Description/Timer */}
                  {editingDescriptionId === todo.id && (
                    <div className="absolute right-8 top-6 z-50 bg-white rounded-lg shadow-xl border border-gray-100 p-2 w-56 flex flex-col gap-2 animate-in fade-in zoom-in-95 cursor-auto">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                        <span>Description</span>
                        <button onClick={() => setEditingDescriptionId(null)}>
                          <X size={12} />
                        </button>
                      </div>
                      <textarea
                        className="w-full h-24 text-xs p-2 border rounded resize-none focus:outline-none focus:border-black/30"
                        placeholder="Add details..."
                        value={todo.description || ""}
                        onChange={(e) =>
                          updateTodoDescription(todo.id, e.target.value)
                        }
                        autoFocus
                      />
                    </div>
                  )}
                  {editingTimerId === todo.id && (
                    <div className="absolute right-6 top-6 z-50 bg-white rounded-lg shadow-xl border border-gray-100 p-2 w-48 flex flex-col gap-2 animate-in fade-in zoom-in-95 cursor-auto">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                        <span>Focus Timer</span>
                        <button onClick={() => setEditingTimerId(null)}>
                          <X size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          className="w-12 border rounded px-1 text-sm text-center"
                          value={todo.timerDuration || 25}
                          onChange={(e) =>
                            updateTodoTimer(
                              todo.id,
                              parseInt(e.target.value) || 25
                            )
                          }
                        />
                        <span className="text-xs text-gray-500">min</span>
                        <button
                          onClick={() => toggleTimer(todo.id)}
                          className="ml-auto bg-black text-white text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-800"
                        >
                          <Play size={10} /> Start
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Description Area */}
                  {todo.isExpanded && todo.description && (
                    <div
                      className={cn(
                        "ml-8 mr-6 mt-1 text-xs opacity-70 whitespace-pre-wrap leading-relaxed border-l-2 border-black/10 pl-2",
                        theme.text
                      )}
                    >
                      {todo.description}
                    </div>
                  )}
                </div>
              ))}

              {/* New Todo Input */}
              <div className="flex items-center gap-2 mt-2 group pl-5">
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <Plus size={14} className="opacity-40" />
                </div>
                <input
                  type="text"
                  placeholder="Add a new task..."
                  className={cn(
                    "bg-transparent outline-none text-sm placeholder:italic w-full",
                    theme.text,
                    "placeholder:opacity-50"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTodo(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {isTasksExpanded && isNotesExpanded && (
          <div className="h-px w-full bg-black/5" />
        )}

        {/* Notes Section */}
        <div
          className={cn(
            "flex flex-col",
            isNotesExpanded ? "flex-1 min-h-[100px]" : "h-auto shrink-0",
            activeTimerTodo ? "blur-sm pointer-events-none opacity-50" : ""
          )}
        >
          <div
            className="flex items-center justify-between mb-1 group cursor-pointer select-none"
            onClick={() => toggleSection("notes")}
          >
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "p-0.5 rounded hover:bg-black/10 transition-colors",
                  theme.text
                )}
              >
                {isNotesExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <h3
                className={cn(
                  "text-xs font-bold uppercase tracking-wider opacity-60",
                  theme.text
                )}
              >
                Notes
              </h3>
            </div>

            {/* MOVE NOTES BUTTON - Only show if expanded or keep visible? Lets keep visible but maybe smaller/faded if collapsed? */}
            {isNotesExpanded && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setMovingNotes(!movingNotes);
                    setMovingTodoId(null);
                  }}
                  className={cn(
                    "opacity-40 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/5",
                    theme.text
                  )}
                  title="Move Notes"
                >
                  <CornerDownRight size={12} />
                </button>
                {movingNotes && (
                  <div className="absolute right-0 bottom-full mb-1 z-50 bg-white rounded-lg shadow-xl border border-gray-100 p-1 w-40 flex flex-col animate-in fade-in zoom-in-95 cursor-auto">
                    <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase">
                      Move Notes to...
                    </div>
                    <button
                      onClick={() =>
                        moveNotes(formatDateKey(addDays(new Date(), 1)))
                      }
                      className="text-left px-2 py-1.5 hover:bg-gray-100 text-xs rounded text-gray-700 flex items-center gap-2"
                    >
                      <CalendarArrowUp size={12} /> Tomorrow
                    </button>
                    <button
                      onClick={() => setShowMoveCalendar(true)}
                      className="text-left px-2 py-1.5 hover:bg-gray-100 text-xs rounded text-gray-700 flex items-center gap-2"
                    >
                      <CalendarIcon size={12} /> Pick Date...
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isNotesExpanded && (
            <RichTextEditor
              initialContent={currentContent.notes}
              onUpdate={(html) => updateContent({ notes: html })}
              textColorClass={theme.text}
            />
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={startResize}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full bg-black/20")} />
      </div>
    </div>
  );
};
