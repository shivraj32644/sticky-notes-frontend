import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DayContent, Group, TodoItem } from "../../../shared/types";
import { IPC } from "../../../shared/constants";
import "./StickyNote.css";
// IPC access
const { ipcRenderer } = window.require
  ? window.require("electron")
  : { ipcRenderer: { invoke: () => Promise.resolve(null), send: () => {} } };

// Helper to format date
const formatDate = (date: Date): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${days[date.getDay()]} • ${date.getDate()} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;
};

// Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Get date key (YYYY-MM-DD)
const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Toast component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="sticky-toast">
      <span>{message}</span>
    </div>
  );
};

// Confetti component
const Confetti: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="sticky-confetti">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="sticky-confetti-particle"
          style={{
            left: `${20 + i * 12}%`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
};

// Motivational messages
const MOTIVATIONAL_MESSAGES = [
  "Great job!",
  "You're on a roll!",
  "Another win!",
  "Future you approves.",
  "Keep it up!",
  "Nice work!",
];

// Motivational message component
const MotivationalMessage: React.FC<{
  message: string;
  onClose: () => void;
}> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="sticky-motivational-message">
      <span>{message}</span>
    </div>
  );
};

const StickyNote: React.FC = () => {
  // Parse groupId from hash
  const hash = window.location.hash;
  const groupId = hash.split("/")[2];

  // State
  const [group, setGroup] = useState<Group | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [notesHtml, setNotesHtml] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(
    null
  );
  const [streak, setStreak] = useState(0);

  // Refs
  const notesEditorRef = useRef<HTMLDivElement>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const confettiContainerRef = useRef<HTMLDivElement>(null);

  // Load group data on mount and handle deletion
  useEffect(() => {
    if (!groupId) return;

    const loadGroup = async () => {
      const groups = await ipcRenderer.invoke(IPC.GROUPS.LIST);
      const foundGroup = groups.find((g: any) => g.id === groupId);
      if (foundGroup) {
        setGroup(foundGroup);
        setEditTitle(foundGroup.title);

        // Apply the saved visibility mode to the window
        await ipcRenderer.invoke(IPC.STICKY_NOTE.SET_ALWAYS_ON_TOP, {
          groupId: groupId,
          alwaysOnTop: foundGroup.visibilityMode === "alwaysOnTop",
        });
      } else {
        // Group was deleted, close the window
        setToast("Group was deleted");
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };

    loadGroup();

    // Listen for group updates/deletions
    const checkGroupExists = setInterval(async () => {
      const groups = await ipcRenderer.invoke(IPC.GROUPS.LIST);
      const foundGroup = groups.find((g: any) => g.id === groupId);
      if (!foundGroup) {
        clearInterval(checkGroupExists);
        setToast("Group was deleted");
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkGroupExists);
  }, [groupId]);

  // Calculate progress (memoized)
  const { totalTodos, completedTodos, progressPercent, allTodosComplete } =
    useMemo(() => {
      const total = todos.length;
      const completed = todos.filter((t) => t.completed).length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      const allComplete = total > 0 && completed === total;
      return {
        totalTodos: total,
        completedTodos: completed,
        progressPercent: percent,
        allTodosComplete: allComplete,
      };
    }, [todos]);

  // Calculate streak
  const calculateStreak = useCallback(async () => {
    if (!groupId) return;

    try {
      const groups = await ipcRenderer.invoke(IPC.GROUPS.LIST);
      const foundGroup = groups.find((g: Group) => g.id === groupId);
      if (!foundGroup || !foundGroup.dayContents) {
        setStreak(0);
        return;
      }

      let streakCount = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = getDateKey(checkDate);
        const dayContent = foundGroup.dayContents?.[dateKey];

        if (dayContent && dayContent.todos && dayContent.todos.length > 0) {
          const hasCompleted = dayContent.todos.some((t: any) => t.completed);
          if (hasCompleted) {
            streakCount++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      setStreak(streakCount);
    } catch (err) {
      console.error("Error calculating streak:", err);
    }
  }, [groupId]);

  // Load day content when date or group changes
  useEffect(() => {
    if (!groupId) return;

    const dateKey = getDateKey(currentDate);
    ipcRenderer
      .invoke(IPC.DAY_CONTENT.GET, { groupId, dateKey })
      .then((dayContent: DayContent | null) => {
        if (dayContent) {
          setNotes(dayContent.notes || "");
          setNotesHtml(dayContent.notes || "");
          setTodos(dayContent.todos || []);
        } else {
          setNotes("");
          setNotesHtml("");
          setTodos([]);
        }
      })
      .catch((err: any) => {
        console.error("Error loading day content:", err);
        setToast("Could not load content");
      });

    calculateStreak();
  }, [groupId, currentDate, calculateStreak]);

  // Auto-save notes with debouncing
  const saveNotes = useCallback(
    async (notesToSave: string) => {
      if (!groupId) return;

      setSaveStatus("saving");
      const dateKey = getDateKey(currentDate);

      try {
        const dayContent: DayContent = {
          date: dateKey,
          notes: notesToSave,
          todos: todos,
        };

        await ipcRenderer.invoke(IPC.DAY_CONTENT.SET, {
          groupId,
          dayContent,
        });

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (err) {
        console.error("Error saving notes:", err);
        setToast("Could not save changes");
        setSaveStatus(null);
      }
    },
    [groupId, currentDate, todos]
  );

  // Debounced save handler
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (notes.trim() || notesHtml.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        saveNotes(notesHtml || notes);
      }, 400);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, notesHtml, saveNotes]);

  // Save on blur
  const handleNotesBlur = () => {
    setShowToolbar(false);
    if (notesHtml || notes) {
      saveNotes(notesHtml || notes);
    }
  };

  // Rich text editor handlers
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    notesEditorRef.current?.focus();
    const html = notesEditorRef.current?.innerHTML || "";
    setNotesHtml(html);
    setNotes(notesEditorRef.current?.innerText || "");
  };

  const handleNotesInput = () => {
    const html = notesEditorRef.current?.innerHTML || "";
    setNotesHtml(html);
    setNotes(notesEditorRef.current?.innerText || "");
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      saveNotes(notesHtml || notes);
    }
  };

  // Save todos
  const saveTodos = useCallback(
    async (todosToSave: TodoItem[]) => {
      if (!groupId) return;

      const dateKey = getDateKey(currentDate);

      try {
        const dayContent: DayContent = {
          date: dateKey,
          notes: notesHtml || notes,
          todos: todosToSave,
        };

        await ipcRenderer.invoke(IPC.DAY_CONTENT.SET, {
          groupId,
          dayContent,
        });
      } catch (err) {
        console.error("Error saving todos:", err);
        setToast("Could not save changes");
      }
    },
    [groupId, currentDate, notesHtml, notes]
  );

  // Handle title edit
  const handleStartEdit = () => {
    if (group) {
      setEditTitle(group.title);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = async () => {
    if (!group || !editTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    if (editTitle.trim() !== group.title) {
      try {
        const updatedGroup = await ipcRenderer.invoke(IPC.GROUPS.UPDATE, {
          ...group,
          title: editTitle.trim(),
        });
        setGroup(updatedGroup);
      } catch (err) {
        setToast("Could not save title");
      }
    }
    setIsEditingTitle(false);
  };

  // Handle visibility mode change
  const handleVisibilityChange = async (mode: "alwaysOnTop" | "standard") => {
    if (!group) return;

    try {
      const updatedGroup = await ipcRenderer.invoke(IPC.GROUPS.UPDATE, {
        ...group,
        visibilityMode: mode,
      });
      setGroup(updatedGroup);
      setShowVisibilityDropdown(false);

      await ipcRenderer.invoke(IPC.STICKY_NOTE.SET_ALWAYS_ON_TOP, {
        groupId: groupId,
        alwaysOnTop: mode === "alwaysOnTop",
      });
    } catch (err) {
      setToast("Could not update visibility");
    }
  };

  // Date navigation
  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const goToDate = (offset: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  // Todos
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const newTodoItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    setNewTodo("");
    await saveTodos(updatedTodos);

    // Keep focus on input
    setTimeout(() => {
      todoInputRef.current?.focus();
    }, 0);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    const wasCompleted = todo?.completed || false;
    const willBeCompleted = !wasCompleted;

    const updatedTodos = todos.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);

    // Trigger celebration if completing a todo
    if (willBeCompleted) {
      setShowConfetti(true);
      const randomMessage =
        MOTIVATIONAL_MESSAGES[
          Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
        ];
      setMotivationalMessage(randomMessage);
      calculateStreak();

      // Check if all todos are now complete
      const allComplete =
        updatedTodos.length > 0 && updatedTodos.every((t) => t.completed);
      if (allComplete) {
        // Extra celebration for completing all todos
        setTimeout(() => {
          setMotivationalMessage("🎉 All done! Amazing work!");
        }, 1500);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter((t) => t.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const startEditingTodo = (todo: TodoItem) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const saveEditingTodo = async () => {
    if (!editingTodoId) return;

    const updatedTodos = todos.map((t) =>
      t.id === editingTodoId ? { ...t, text: editingTodoText.trim() } : t
    );
    setTodos(updatedTodos);
    setEditingTodoId(null);
    setEditingTodoText("");
    await saveTodos(updatedTodos);
  };

  const cancelEditingTodo = () => {
    setEditingTodoId(null);
    setEditingTodoText("");
  };

  // Keyboard shortcuts for todos
  const handleTodoKeyDown = (
    e: React.KeyboardEvent,
    todoId: string,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEditingTodo();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditingTodo();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) {
        const prevTodo = todos[index - 1];
        startEditingTodo(prevTodo);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (index < todos.length - 1) {
        const nextTodo = todos[index + 1];
        startEditingTodo(nextTodo);
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowVisibilityDropdown(false);
      setShowMenu(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!group) {
    return (
      <div className="sticky-container">
        <div className="sticky-loading">Loading...</div>
      </div>
    );
  }

  const todayDate = new Date();
  const isCurrentToday = isToday(currentDate);
  const isYesterday =
    currentDate.toDateString() ===
    new Date(todayDate.setDate(todayDate.getDate() - 1)).toDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const isTomorrow = currentDate.toDateString() === tomorrowDate.toDateString();

  return (
    <div className="sticky-container">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="sticky-header">
        <div className="sticky-title-section">
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
              autoFocus
              className="sticky-title-input"
            />
          ) : (
            <span
              onClick={handleStartEdit}
              className="sticky-title"
              title="Click to rename"
            >
              {group.title}
            </span>
          )}
          {streak > 0 && (
            <span className="sticky-streak" title={`${streak}-day streak`}>
              🔥 {streak}
            </span>
          )}
        </div>

        <div className="sticky-controls">
          {/* Visibility Dropdown */}
          <div className="sticky-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVisibilityDropdown(!showVisibilityDropdown);
                setShowMenu(false);
              }}
              className="sticky-control-btn"
              title="Visibility"
            >
              {group.visibilityMode === "alwaysOnTop" ? "📌" : "📋"}
            </button>
            {showVisibilityDropdown && (
              <div
                className="sticky-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  onClick={() => handleVisibilityChange("alwaysOnTop")}
                  className={`sticky-dropdown-item ${
                    group.visibilityMode === "alwaysOnTop" ? "active" : ""
                  }`}
                >
                  📌 Always visible
                </div>
                <div
                  onClick={() => handleVisibilityChange("standard")}
                  className={`sticky-dropdown-item ${
                    group.visibilityMode === "standard" ? "active" : ""
                  }`}
                >
                  📋 Standard
                </div>
              </div>
            )}
          </div>

          {/* Calendar Button */}
          <button className="sticky-control-btn" title="Open calendar">
            📅
          </button>

          {/* Menu */}
          <div className="sticky-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
                setShowVisibilityDropdown(false);
              }}
              className="sticky-control-btn"
              title="More options"
            >
              ⋯
            </button>
            {showMenu && (
              <div
                className="sticky-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky-dropdown-item">🎨 Theme</div>
                <div className="sticky-dropdown-item">📊 Stats</div>
                <div className="sticky-dropdown-item danger">🗑️ Delete</div>
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              todoInputRef.current?.focus();
            }}
            className="sticky-control-btn sticky-quick-add-btn"
            title="Quick add todo"
          >
            +
          </button>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.close();
            }}
            className="sticky-control-btn sticky-close-btn"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Date Bar */}
      <div className="sticky-date-bar">
        <div className="sticky-date-nav">
          <button
            className="sticky-date-arrow"
            onClick={() => navigateDate("prev")}
          >
            ‹
          </button>
          <span className="sticky-date-text">
            {isCurrentToday
              ? "Today"
              : isYesterday
              ? "Yesterday"
              : isTomorrow
              ? "Tomorrow"
              : ""}{" "}
            • {formatDate(currentDate)}
          </span>
          <button
            className="sticky-date-arrow"
            onClick={() => navigateDate("next")}
          >
            ›
          </button>
        </div>

        {/* Progress Indicator */}
        {totalTodos > 0 && (
          <div className="sticky-progress-container">
            <div className="sticky-progress-bar">
              <div
                className="sticky-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="sticky-progress-text">
              {progressPercent}% done ({completedTodos}/{totalTodos} tasks)
            </span>
          </div>
        )}

        <div className="sticky-quick-chips">
          <button
            className={`sticky-chip ${isYesterday ? "active" : ""}`}
            onClick={() => goToDate(-1)}
          >
            Yesterday
          </button>
          <button
            className={`sticky-chip ${isCurrentToday ? "active" : ""}`}
            onClick={() => goToDate(0)}
          >
            Today
          </button>
          <button
            className={`sticky-chip ${isTomorrow ? "active" : ""}`}
            onClick={() => goToDate(1)}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Confetti Container */}
      {showConfetti && (
        <div ref={confettiContainerRef} className="sticky-confetti-container">
          <Confetti onComplete={() => setShowConfetti(false)} />
        </div>
      )}

      {/* Motivational Message */}
      {motivationalMessage && (
        <MotivationalMessage
          message={motivationalMessage}
          onClose={() => setMotivationalMessage(null)}
        />
      )}

      {/* Content Area */}
      <div className="sticky-content">
        {/* Notes Section */}
        <div className="sticky-section">
          <div className="sticky-section-header">
            <span className="sticky-section-label">Notes</span>
            {saveStatus && (
              <span
                className={`sticky-save-status ${
                  saveStatus === "saved" ? "saved" : ""
                }`}
              >
                {saveStatus === "saved" ? "✓ Saved" : "Saving..."}
              </span>
            )}
          </div>
          <div className="sticky-section-divider" />

          {/* Rich Text Toolbar */}
          {showToolbar && (
            <div className="sticky-toolbar">
              <button
                onClick={() => execCommand("bold")}
                className="sticky-toolbar-btn"
                title="Bold (Cmd/Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => execCommand("italic")}
                className="sticky-toolbar-btn"
                title="Italic (Cmd/Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                onClick={() => execCommand("underline")}
                className="sticky-toolbar-btn"
                title="Underline (Cmd/Ctrl+U)"
              >
                <u>U</u>
              </button>
              <button
                onClick={() => execCommand("insertUnorderedList")}
                className="sticky-toolbar-btn"
                title="Bullet List"
              >
                •
              </button>
            </div>
          )}

          {/* Rich Text Editor */}
          <div
            ref={notesEditorRef}
            contentEditable
            className="sticky-notes-editor"
            data-placeholder="Write notes for this day..."
            onInput={handleNotesInput}
            onFocus={() => setShowToolbar(true)}
            onBlur={handleNotesBlur}
            onKeyDown={handleNotesKeyDown}
            onMouseUp={() => {
              const selection = window.getSelection();
              if (selection && selection.toString().length > 0) {
                setShowToolbar(true);
              }
            }}
            suppressContentEditableWarning
          />
        </div>

        {/* Todos Section */}
        <div className="sticky-section">
          <div className="sticky-section-header">
            <span className="sticky-section-label">Todos</span>
            <span className="sticky-section-count">
              {todos.filter((t) => t.completed).length}/{todos.length}
            </span>
          </div>
          <div className="sticky-section-divider" />

          {/* Add Todo Input */}
          <div className="sticky-todo-input-container">
            <input
              ref={todoInputRef}
              type="text"
              className="sticky-todo-input"
              placeholder="Add a todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTodo();
                }
              }}
            />
            <button className="sticky-todo-add-btn" onClick={addTodo}>
              +
            </button>
          </div>

          {/* Todo List */}
          <div className="sticky-todo-list sticky-todo-list-scrollable">
            {todos.length === 0 ? (
              <div className="sticky-empty-state">
                <span className="sticky-empty-icon">✓</span>
                <span className="sticky-empty-text">
                  No todos yet for this date
                </span>
              </div>
            ) : (
              todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={`sticky-todo-item ${
                    todo.completed ? "completed" : ""
                  } ${editingTodoId === todo.id ? "editing" : ""}`}
                >
                  <button
                    className={`sticky-todo-checkbox ${
                      todo.completed ? "checked" : ""
                    }`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed && <span className="check-mark">✓</span>}
                  </button>
                  {editingTodoId === todo.id ? (
                    <input
                      type="text"
                      className="sticky-todo-edit-input"
                      value={editingTodoText}
                      onChange={(e) => setEditingTodoText(e.target.value)}
                      onKeyDown={(e) => handleTodoKeyDown(e, todo.id, index)}
                      onBlur={saveEditingTodo}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="sticky-todo-text"
                      onDoubleClick={() => startEditingTodo(todo)}
                    >
                      {todo.text}
                    </span>
                  )}
                  <button
                    className="sticky-todo-delete"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyNote;
