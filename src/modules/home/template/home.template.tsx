import React, { useEffect, useState } from "react";
import { useStore } from "../../../lib/store";
import { Group } from "../../../shared/types";
import { IPC } from "../../../shared/constants";

// IPC access
const { ipcRenderer } = window.require
  ? window.require("electron")
  : { ipcRenderer: { invoke: () => Promise.resolve([]), send: () => {} } };

// Helper to format relative time
const formatRelativeTime = (isoString: string | undefined): string => {
  if (!isoString) return "Just now";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const HomePageTemplate: React.FC = () => {
  const {
    groups,
    setGroups,
    addGroup,
    updateGroup,
    deleteGroup,
    searchQuery,
    setSearchQuery,
    getFilteredGroups,
  } = useStore();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Load groups on mount
  useEffect(() => {
    ipcRenderer.invoke(IPC.GROUPS.LIST).then((initialGroups: Group[]) => {
      setGroups(initialGroups);
    });
  }, [setGroups]);

  // Create group handler
  const handleCreateGroup = async () => {
    if (!newGroupTitle.trim()) return;

    const newGroup = await ipcRenderer.invoke(IPC.GROUPS.CREATE, {
      title: newGroupTitle.trim(),
    });
    addGroup(newGroup);
    setNewGroupTitle("");
    setShowCreateModal(false);

    // Open the new group immediately
    ipcRenderer.send(IPC.STICKY_NOTE.OPEN, { groupId: newGroup.id });
  };

  // Open group handler
  const handleOpenGroup = (groupId: string) => {
    ipcRenderer.send(IPC.STICKY_NOTE.OPEN, { groupId });
  };

  // Start rename
  const handleStartRename = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setEditingTitle(group.title);
  };

  // Save rename
  const handleSaveRename = async (groupId: string) => {
    if (!editingTitle.trim()) {
      setEditingGroupId(null);
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (group && editingTitle.trim() !== group.title) {
      const updatedGroup = await ipcRenderer.invoke(IPC.GROUPS.UPDATE, {
        ...group,
        title: editingTitle.trim(),
      });
      updateGroup(updatedGroup);
    }
    setEditingGroupId(null);
  };

  // Delete group handler
  const handleDeleteGroup = async (groupId: string) => {
    await ipcRenderer.invoke(IPC.GROUPS.DELETE, { id: groupId });
    deleteGroup(groupId);
    setShowDeleteConfirm(null);
  };

  const filteredGroups = getFilteredGroups();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Float Notes</h1>
        <p style={styles.subtitle}>Your floating sticky notes</p>
      </div>

      {/* Search and Create */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          + New Group Note
        </button>
      </div>

      {/* Groups List */}
      <div style={styles.groupsGrid}>
        {filteredGroups.length === 0 ? (
          <div style={styles.emptyState}>
            {searchQuery
              ? "No groups match your search"
              : "No groups yet. Create your first one!"}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleOpenGroup(group.id)}
              style={styles.groupCard}
            >
              {/* Title - editable or display */}
              {editingGroupId === group.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveRename(group.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename(group.id);
                    if (e.key === "Escape") setEditingGroupId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  style={styles.renameInput}
                />
              ) : (
                <h3 style={styles.groupTitle}>{group.title}</h3>
              )}

              {/* Meta info */}
              <div style={styles.groupMeta}>
                <span style={styles.updatedTime}>
                  {formatRelativeTime(group.updatedAt)}
                </span>
                {group.stats?.streak && (
                  <span style={styles.streakBadge}>
                    🔥 {group.stats.streak}d streak
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={styles.groupActions}>
                <button
                  onClick={(e) => handleStartRename(group, e)}
                  style={styles.actionButton}
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(group.id);
                  }}
                  style={styles.actionButton}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Group</h2>
            <input
              type="text"
              placeholder="Enter group name..."
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateGroup();
                if (e.key === "Escape") setShowCreateModal(false);
              }}
              autoFocus
              style={styles.modalInput}
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                style={styles.confirmButton}
                disabled={!newGroupTitle.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Group?</h2>
            <p style={styles.modalText}>
              Are you sure you want to delete this group? This action cannot be
              undone.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGroup(showDeleteConfirm)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "24px",
    height: "100vh",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "bold",
    color: "var(--accent-color)",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#888",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 1,
    padding: "10px 14px",
    backgroundColor: "var(--panel-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-color)",
    fontSize: "14px",
    outline: "none",
  },
  createButton: {
    padding: "10px 20px",
    backgroundColor: "var(--accent-color)",
    color: "var(--accent-text)",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  groupsGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
    overflowY: "auto",
    alignContent: "start",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "14px",
  },
  groupCard: {
    padding: "16px",
    backgroundColor: "var(--panel-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "transform 0.15s, border-color 0.15s",
    position: "relative",
  },
  groupTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-color)",
    wordBreak: "break-word",
  },
  renameInput: {
    width: "100%",
    padding: "4px 8px",
    backgroundColor: "var(--bg-color)",
    border: "1px solid var(--accent-color)",
    borderRadius: "4px",
    color: "var(--text-color)",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    boxSizing: "border-box",
  },
  groupMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  updatedTime: {
    fontSize: "12px",
    color: "#888",
  },
  streakBadge: {
    fontSize: "11px",
    padding: "2px 6px",
    backgroundColor: "rgba(247, 213, 71, 0.2)",
    color: "var(--accent-color)",
    borderRadius: "4px",
  },
  groupActions: {
    display: "flex",
    gap: "4px",
    marginTop: "8px",
  },
  actionButton: {
    padding: "4px 8px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "background-color 0.15s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "var(--panel-bg)",
    padding: "24px",
    borderRadius: "12px",
    width: "320px",
    maxWidth: "90%",
  },
  modalTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "600",
  },
  modalText: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    color: "#aaa",
  },
  modalInput: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "var(--bg-color)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-color)",
    fontSize: "14px",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    color: "var(--text-color)",
    cursor: "pointer",
    fontSize: "14px",
  },
  confirmButton: {
    padding: "8px 16px",
    backgroundColor: "var(--accent-color)",
    border: "none",
    borderRadius: "6px",
    color: "var(--accent-text)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  deleteButton: {
    padding: "8px 16px",
    backgroundColor: "#e74c3c",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default HomePageTemplate;
