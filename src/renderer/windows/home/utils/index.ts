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
import confetti from "canvas-confetti";

declare global {
  interface Window {
    confetti: typeof confetti;
  }
}

// Ensure confetti is available on window (for Electron compatibility)
if (typeof window !== "undefined" && !window.confetti) {
  (window as any).confetti = confetti;
}

export const triggerConfetti = (x?: number, y?: number) => {
  try {
    // Use the imported confetti directly, or fallback to window.confetti
    const confettiFn = confetti || window.confetti;

    if (confettiFn) {
      // Center the confetti for better visibility (won't be cut off)
      // If coordinates provided, use them but ensure they're within bounds
      let xNorm = 0.5; // Center horizontally
      let yNorm = 0.5; // Center vertically

      if (x !== undefined && y !== undefined) {
        // Normalize coordinates but keep them centered if too close to edges
        const normalizedX = x / window.innerWidth;
        const normalizedY = y / window.innerHeight;

        // Use provided position but ensure it's not too close to edges
        // This prevents cut-off while still showing confetti near the action
        xNorm = Math.max(0.2, Math.min(0.8, normalizedX));
        yNorm = Math.max(0.3, Math.min(0.7, normalizedY)); // Keep it in middle-upper area
      }

      // Create multiple bursts for a more impressive effect
      const colors = [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff",
      ];

      // Main burst - centered
      confettiFn({
        particleCount: 50,
        spread: 70,
        origin: { x: xNorm, y: yNorm },
        colors,
        disableForReducedMotion: true,
        zIndex: 9999,
      });

      // Additional bursts for more coverage
      setTimeout(() => {
        confettiFn({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: xNorm - 0.1, y: yNorm },
          colors,
          disableForReducedMotion: true,
          zIndex: 9999,
        });
      }, 100);

      setTimeout(() => {
        confettiFn({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: xNorm + 0.1, y: yNorm },
          colors,
          disableForReducedMotion: true,
          zIndex: 9999,
        });
      }, 200);
    }
  } catch (error) {
    console.warn("Confetti effect failed:", error);
  }
};
