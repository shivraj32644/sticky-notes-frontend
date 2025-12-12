import { BrowserWindow, app } from "electron";
import path from "path";
import { getGroups } from "../data/storage";
import { Group } from "../../shared/types";

// Track open sticky note windows by groupId
const stickyNoteWindows: Map<string, BrowserWindow> = new Map();

/**
 * Opens a sticky note window for the given group.
 * If a window already exists for this group, focuses it instead.
 * Automatically applies the group's visibility mode.
 */
export const openStickyNoteWindow = async (
  groupId: string,
  alwaysOnTop?: boolean
) => {
  // Check if window already exists for this group
  const existingWindow = stickyNoteWindows.get(groupId);
  if (existingWindow && !existingWindow.isDestroyed()) {
    // Ensure visibility mode is up to date
    const groups = await getGroups();
    const group = groups.find((g: Group) => g.id === groupId);
    if (group) {
      const shouldBeAlwaysOnTop = group.visibilityMode === "alwaysOnTop";
      existingWindow.setAlwaysOnTop(shouldBeAlwaysOnTop, "floating");
    }
    existingWindow.focus();
    return existingWindow;
  }

  // If alwaysOnTop not provided, fetch from group data
  if (alwaysOnTop === undefined) {
    const groups = await getGroups();
    const group = groups.find((g: Group) => g.id === groupId);
    alwaysOnTop = group?.visibilityMode === "alwaysOnTop" || false;
  }

  // Create new window with polish
  const noteWindow = new BrowserWindow({
    width: 320,
    height: 400,
    minWidth: 250,
    minHeight: 300,
    frame: false,
    transparent: false,
    alwaysOnTop: alwaysOnTop,
    resizable: true,
    skipTaskbar: false,
    backgroundColor: "#1e1e1e", // Match theme background
    show: false, // Don't show until ready for fade-in
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Fade-in animation when window is ready
  noteWindow.once("ready-to-show", () => {
    noteWindow.show();
    // Subtle fade-in effect
    noteWindow.setOpacity(0);
    let opacity = 0;
    const fadeInterval = setInterval(() => {
      opacity += 0.1;
      if (opacity >= 1) {
        noteWindow.setOpacity(1);
        clearInterval(fadeInterval);
      } else {
        noteWindow.setOpacity(opacity);
      }
    }, 16); // ~60fps
  });

  // Build URL with groupId
  const url = !app.isPackaged
    ? `http://localhost:5173/#/sticky/${groupId}`
    : `file://${path.join(
        __dirname,
        "../../../dist/index.html"
      )}#/sticky/${groupId}`;

  noteWindow.loadURL(url);

  // Store reference
  stickyNoteWindows.set(groupId, noteWindow);

  // Clean up when window closes
  noteWindow.on("closed", () => {
    stickyNoteWindows.delete(groupId);
  });

  return noteWindow;
};

/**
 * Get the window for a specific group if it exists
 */
export const getStickyNoteWindow = (groupId: string): BrowserWindow | null => {
  const window = stickyNoteWindows.get(groupId);
  if (window && !window.isDestroyed()) {
    return window;
  }
  return null;
};

/**
 * Close a sticky note window for a specific group
 */
export const closeStickyNoteWindow = (groupId: string): void => {
  const window = stickyNoteWindows.get(groupId);
  if (window && !window.isDestroyed()) {
    window.close();
  }
};

/**
 * Set the alwaysOnTop property for a sticky note window
 * Maintains window position and size during the change
 */
export const setAlwaysOnTop = (
  groupId: string,
  alwaysOnTop: boolean
): boolean => {
  const window = stickyNoteWindows.get(groupId);
  if (window && !window.isDestroyed()) {
    // Get current position and size to maintain them
    const [x, y] = window.getPosition();
    const [width, height] = window.getSize();

    // Set alwaysOnTop with "floating" level to avoid flickers
    window.setAlwaysOnTop(alwaysOnTop, "floating");

    // Ensure position and size are maintained (should be, but explicit is better)
    window.setPosition(x, y);
    window.setSize(width, height);

    return true;
  }
  return false;
};

// Re-export for backwards compatibility
export const createStickyNoteWindow = openStickyNoteWindow;
