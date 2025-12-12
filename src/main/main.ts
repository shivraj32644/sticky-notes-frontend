import { app, BrowserWindow } from "electron";
import { createHomeWindow } from "./windows/homeWindow";
import { registerIpcHandlers } from "./ipc";

// Register IPC channels
registerIpcHandlers();

app.whenReady().then(() => {
  createHomeWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createHomeWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
