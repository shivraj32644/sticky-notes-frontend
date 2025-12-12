import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

import { formatDateKey, getMonthDays, getTodayKey } from "../../home/utils";
import { cn } from "../../../../lib/utils";
import { DayContent } from "../../../../shared/types";

interface CalendarViewProps {
  currentDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onClose: () => void;
  groupData: Record<string, DayContent> | undefined;
  themeClass?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDateKey,
  onSelectDate,
  onClose,
  groupData,
  themeClass,
}) => {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m, d] = currentDateKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  });

  const todayKey = getTodayKey();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const daysInMonth = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayOfWeek = daysInMonth[0].getDay(); // 0 = Sun

  // Padding days for grid
  const paddingDays = Array.from({ length: firstDayOfWeek }).map((_, i) => i);

  return (
    <div className="absolute top-10 left-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800 text-sm">
          {viewDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="text-[10px] font-bold text-gray-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((i) => (
          <div key={`pad-${i}`} />
        ))}
        {daysInMonth.map((date) => {
          const key = formatDateKey(date);
          const isSelected = key === currentDateKey;
          const isToday = key === todayKey;
          const dayContent = groupData?.[key];
          const hasContent =
            dayContent &&
            (dayContent.todos.length > 0 ||
              (dayContent.notes && dayContent.notes.trim().length > 0));
          const todos = dayContent?.todos || [];
          const allDone = todos.length > 0 && todos.every((t) => t.completed);

          return (
            <button
              key={key}
              onClick={() => {
                onSelectDate(key);
                onClose();
              }}
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs relative transition-colors",
                isSelected
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-700",
                isToday && !isSelected ? "ring-1 ring-black/20 font-bold" : ""
              )}
            >
              {date.getDate()}
              {hasContent && !isSelected && (
                <div
                  className={cn(
                    "absolute bottom-0.5 w-1 h-1 rounded-full",
                    allDone ? "bg-green-500" : "bg-gray-400"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
