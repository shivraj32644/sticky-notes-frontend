import { useState, useEffect } from "react";
import {
  Plus,
  LayoutGrid,
  Search,
  StickyNote as StickyIcon,
  Monitor,
} from "lucide-react";

import { StickyGroup, AppState } from "../types/index";
import { generateId, getTodayKey } from "../utils/index";
import { cn } from "../../../lib/utils/index";

const INITIAL_GROUPS: StickyGroup[] = [
  {
    id: "1",
    title: "Welcome & Onboarding",
    theme: "yellow",
    x: 100,
    y: 100,
    width: 320,
    height: 400,
    isAlwaysVisible: false,
    isOpen: true,
    lastSelectedDate: getTodayKey(),
    viewMode: "date",
    foreverContent: { notes: "", todos: [] },
    content: {
      [getTodayKey()]: {
        notes:
          "Welcome to <b>StickyPlan</b>! <br><br>This is a minimal sticky-note planner designed to help you organize your life project by project.<br><br>Try dragging this window, resizing it, or adding a new task below.",
        todos: [
          { id: "t1", text: "Try checking off this task", completed: false },
          { id: "t2", text: "Create a new group note", completed: false },
          { id: "t3", text: "Explore the calendar view", completed: false },
        ],
      },
    },
  },
];
export const HomePageTemplateGemini = () => {
  const [groups, setGroups] = useState<StickyGroup[]>(() => {
    const saved = localStorage.getItem("sticky-plan-data");
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [topZIndex, setTopZIndex] = useState(10);
  const [showHome, setShowHome] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("sticky-plan-data", JSON.stringify(groups));
  }, [groups]);

  const addGroup = () => {
    const newGroup: StickyGroup = {
      id: generateId(),
      title: "New Project",
      theme: "blue",
      x: window.innerWidth / 2 - 160 + (Math.random() * 40 - 20),
      y: window.innerHeight / 2 - 200 + (Math.random() * 40 - 20),
      width: 300,
      height: 380,
      isAlwaysVisible: false,
      isOpen: true,
      lastSelectedDate: getTodayKey(),
      viewMode: "date",
      foreverContent: { notes: "", todos: [] },
      content: {},
    };
    setGroups([...groups, newGroup]);
    bringToFront(newGroup.id);
    setShowHome(false);
  };

  const updateGroup = (updated: StickyGroup) => {
    setGroups(groups.map((g) => (g.id === updated.id ? updated : g)));
  };

  const closeGroup = (id: string) => {
    // Instead of deleting, we just "close" it visually, effectively minimizing it to the home screen
    // Or we can delete. Let's provide Delete in the menu and Close here.
    // For this app, let's say "Close" removes it from the desktop but keeps it in the list.
    updateGroup({ ...groups.find((g) => g.id === id)!, isOpen: false });
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  const openGroup = (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (group) {
      if (!group.isOpen) {
        // Reposition if off screen (optional safety)
        const safeX = Math.min(Math.max(group.x, 0), window.innerWidth - 100);
        const safeY = Math.min(Math.max(group.y, 0), window.innerHeight - 100);
        updateGroup({ ...group, isOpen: true, x: safeX, y: safeY });
      }
      bringToFront(id);
      setShowHome(false);
    }
  };

  const bringToFront = (id: string) => {
    // Only affect z-index if not "Always Visible"
    // "Always Visible" is handled by CSS class/style in the component (z-9999)
    // Here we manage the relative z-index of standard notes.
    // We can just remove it from array and push to end?
    // No, better to use an explicit zIndex state logic or just rely on render order.
    // Let's use simple React render order for "standard" notes. The last one rendered is on top.

    // Move the accessed group to the end of the array to render it last (on top)
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) return;

    const newGroups = [...groups];
    const [movedGroup] = newGroups.splice(index, 1);
    newGroups.push(movedGroup);
    setGroups(newGroups);
  };

  const filteredGroups = groups.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 font-sans selection:bg-blue-200">
      {/* Background / Wallpaper UI elements to make it feel like a desktop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Taskbar / Dock Area (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/40 z-[10000]">
        <button
          onClick={() => setShowHome(!showHome)}
          className={cn(
            "p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95",
            showHome
              ? "bg-blue-100 text-blue-600 shadow-inner"
              : "hover:bg-white/50"
          )}
          title="Home / All Projects"
        >
          <LayoutGrid size={24} />
        </button>
        <div className="w-px h-8 bg-black/10 mx-1"></div>
        <button
          onClick={addGroup}
          className="p-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-black/20"
          title="New Sticky Note"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Home / Dashboard View Overlay */}
      {showHome && (
        <div
          className="absolute inset-0 z-[10001] bg-white/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowHome(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                  My Projects
                </h1>
                <p className="text-gray-500">
                  Manage your floating sticky notes.
                </p>
              </div>
              <button
                onClick={addGroup}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-transform active:scale-95"
              >
                <Plus size={18} /> New Note
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search your projects..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-4">
              {filteredGroups.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  No projects found. Create one!
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => openGroup(group.id)}
                    className={cn(
                      "group relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between h-40",
                      group.isOpen
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-3",
                          group.theme === "dark"
                            ? "bg-gray-800 text-white"
                            : `bg-${group.theme}-100 text-${group.theme}-600`
                        )}
                      >
                        <StickyIcon size={20} />
                      </div>
                      {group.isOpen && (
                        <div
                          className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                          title="Open on desktop"
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 truncate">
                        {group.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Last edited:{" "}
                        {group.lastSelectedDate === getTodayKey()
                          ? "Today"
                          : group.lastSelectedDate}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(group.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render Open Sticky Notes */}
      {/* {groups
        .filter((g) => g.isOpen)
        .map((group, index) => (
          <StickyNote
            key={group.id}
            group={group}
            onUpdate={updateGroup}
            onClose={closeGroup}
            onFocus={bringToFront}
            zIndex={index + 10}
          />
        ))} */}
    </div>
  );
};
