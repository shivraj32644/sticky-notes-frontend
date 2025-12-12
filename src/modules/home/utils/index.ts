export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getTodayKey = () => formatDateKey(new Date());

export const parseDateKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDisplayDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const getMonthDays = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Motivational quotes
export const MOTIVATIONAL_QUOTES = [
  "Nice, one more done!",
  "You're on a roll!",
  "Future you will thank you.",
  "Making progress!",
  "Keep it up!",
  "One step closer.",
  "Small wins matter.",
  "Excellent work!",
];

export const getRandomQuote = () =>
  MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

// Confetti Wrapper
declare global {
  interface Window {
    confetti: any;
  }
}

export const triggerConfetti = (x: number, y: number) => {
  if (window.confetti) {
    // Normalize coordinates to 0-1 range for the canvas
    const xNorm = x / window.innerWidth;
    const yNorm = y / window.innerHeight;

    window.confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: xNorm, y: yNorm },
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff",
      ],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  }
};
