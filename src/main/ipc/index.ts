import { ipcMain } from "electron";
import { IPC } from "../../shared/constants";
import { Group, DayContent } from "../../shared/types";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getDayContent,
  setDayContent,
} from "../data/storage";
import {
  openStickyNoteWindow,
  setAlwaysOnTop,
  closeStickyNoteWindow,
} from "../windows/stickyNoteWindow";

export const registerIpcHandlers = () => {
  // Get all groups
  ipcMain.handle(IPC.GROUPS.LIST, async () => {
    return await getGroups();
  });

  // Create a new group
  ipcMain.handle(
    IPC.GROUPS.CREATE,
    async (_event, payload: { title: string }) => {
      const newGroup = await createGroup(payload.title);
      return newGroup;
    }
  );

  // Update an existing group
  ipcMain.handle(IPC.GROUPS.UPDATE, async (_event, group: Group) => {
    return await updateGroup(group);
  });

  // Delete a group
  ipcMain.handle(IPC.GROUPS.DELETE, async (_event, payload: { id: string }) => {
    await deleteGroup(payload.id);
    // Close the sticky note window if it's open
    closeStickyNoteWindow(payload.id);
    return { success: true };
  });

  // Open sticky note window for a group
  ipcMain.on(
    IPC.STICKY_NOTE.OPEN,
    async (_event, payload: { groupId: string }) => {
      await openStickyNoteWindow(payload.groupId);
    }
  );

  // Set alwaysOnTop for a sticky note window
  ipcMain.handle(
    IPC.STICKY_NOTE.SET_ALWAYS_ON_TOP,
    (_event, payload: { groupId: string; alwaysOnTop: boolean }) => {
      return setAlwaysOnTop(payload.groupId, payload.alwaysOnTop);
    }
  );

  // Get day content for a group and date
  ipcMain.handle(
    IPC.DAY_CONTENT.GET,
    async (_event, payload: { groupId: string; dateKey: string }) => {
      return await getDayContent(payload.groupId, payload.dateKey);
    }
  );

  // Set day content for a group and date
  ipcMain.handle(
    IPC.DAY_CONTENT.SET,
    async (_event, payload: { groupId: string; dayContent: DayContent }) => {
      return await setDayContent(payload.groupId, payload.dayContent);
    }
  );
};
