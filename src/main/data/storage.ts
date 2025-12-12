import Store from "electron-store";
import { randomUUID } from "crypto";
import { Group, DayContent, TodoItem } from "../../shared/types";

// Schema for electron-store
interface StoreSchema {
  groups: Group[];
}

// Initialize store with default empty groups array
const store = new Store<StoreSchema>({
  defaults: {
    groups: [],
  },
});

/**
 * Get all groups from storage
 */
export const getGroups = async (): Promise<Group[]> => {
  return store.get("groups");
};

/**
 * Create a new group with the given title
 */
export const createGroup = async (title: string): Promise<Group> => {
  const now = new Date().toISOString();
  const newGroup: Group = {
    id: randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    visibilityMode: "standard",
  };

  const groups = store.get("groups");
  groups.push(newGroup);
  store.set("groups", groups);

  return newGroup;
};

/**
 * Update an existing group
 */
export const updateGroup = async (group: Group): Promise<Group> => {
  const groups = store.get("groups");
  const index = groups.findIndex((g) => g.id === group.id);

  if (index === -1) {
    throw new Error(`Group with id ${group.id} not found`);
  }

  // Update the updatedAt timestamp
  const updatedGroup: Group = {
    ...group,
    updatedAt: new Date().toISOString(),
  };

  groups[index] = updatedGroup;
  store.set("groups", groups);

  return updatedGroup;
};

/**
 * Delete a group by id
 */
export const deleteGroup = async (id: string): Promise<void> => {
  const groups = store.get("groups");
  const filteredGroups = groups.filter((g) => g.id !== id);

  if (filteredGroups.length === groups.length) {
    throw new Error(`Group with id ${id} not found`);
  }

  store.set("groups", filteredGroups);
};

/**
 * Get day content for a specific group and date
 */
export const getDayContent = async (
  groupId: string,
  dateKey: string
): Promise<DayContent | null> => {
  const groups = store.get("groups");
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  if (!group.dayContents || !group.dayContents[dateKey]) {
    return null;
  }

  return group.dayContents[dateKey];
};

/**
 * Set day content for a specific group and date
 */
export const setDayContent = async (
  groupId: string,
  dayContent: DayContent
): Promise<DayContent> => {
  const groups = store.get("groups");
  const groupIndex = groups.findIndex((g) => g.id === groupId);

  if (groupIndex === -1) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  const group = groups[groupIndex];
  const updatedGroup: Group = {
    ...group,
    dayContents: {
      ...group.dayContents,
      [dayContent.date]: dayContent,
    },
    updatedAt: new Date().toISOString(),
  };

  groups[groupIndex] = updatedGroup;
  store.set("groups", groups);

  return dayContent;
};
