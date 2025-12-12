import { BrowserWindow, app } from "electron";
import path from "path";

let homeWindow: BrowserWindow | null = null;

export const createHomeWindow = () => {
  if (homeWindow && !homeWindow.isDestroyed()) {
    homeWindow.focus();
    return;
  }

  homeWindow = new BrowserWindow({
    width: 600,
    height: 700,
    title: "Notes",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this early stage, usually prefer true + preload
    },
    // Adding minimal styling config if needed later
  });

  // Load the local URL for development or the local file for production
  if (!app.isPackaged) {
    homeWindow.loadURL("http://localhost:5173/#/home");
  } else {
    homeWindow.loadFile(path.join(__dirname, "../../../dist/index.html"), {
      hash: "home",
    });
  }

  homeWindow.on("closed", () => {
    homeWindow = null;
  });
};
