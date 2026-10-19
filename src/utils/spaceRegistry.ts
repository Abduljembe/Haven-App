import { CoupleSpaceConfig, SavedSpaceRecord, SpaceType } from '../types';

const SAVED_SPACES_KEY = 'haven_saved_spaces_registry';
const DELETED_SPACES_KEY = 'haven_deleted_spaces_registry';
const SEEDED_KEY = 'haven_friends_seeded_v1';

export function getDeletedSpaces(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SPACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markSpaceAsDeleted(roomId: string): void {
  if (!roomId) return;
  try {
    const deleted = getDeletedSpaces();
    const normalized = roomId.toLowerCase().trim();
    if (!deleted.includes(normalized)) {
      localStorage.setItem(DELETED_SPACES_KEY, JSON.stringify([...deleted, normalized]));
    }
  } catch (err) {
    console.error('Failed to mark space as deleted:', err);
  }
}

export function unmarkSpaceAsDeleted(roomId: string): void {
  if (!roomId) return;
  try {
    const deleted = getDeletedSpaces();
    const normalized = roomId.toLowerCase().trim();
    const updated = deleted.filter((id) => id !== normalized);
    localStorage.setItem(DELETED_SPACES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to unmark space as deleted:', err);
  }
}

export const DEFAULT_FRIEND_SPACES: SavedSpaceRecord[] = [];

/**
 * Get all previously joined spaces from local storage, sorted by most recently visited.
 * Ensures deleted groups or spaces are permanently filtered out and never re-seeded.
 * Strictly guarantees every returned record has a unique roomId.
 */
export function getSavedSpaces(): SavedSpaceRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_SPACES_KEY);
    const deletedSpaces = getDeletedSpaces().map((id) => id.toLowerCase().trim());
    let list: SavedSpaceRecord[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }

    // Deduplicate existing items and filter out any deleted spaces
    const seenIds = new Set<string>();
    const sanitizedList: SavedSpaceRecord[] = [];

    for (const item of list) {
      if (!item || !item.roomId) continue;
      const normId = item.roomId.toLowerCase().trim();
      if (!normId || seenIds.has(normId) || deletedSpaces.includes(normId)) {
        continue;
      }
      seenIds.add(normId);
      sanitizedList.push({
        ...item,
        roomId: normId,
      });
    }

    // Auto-seed default friend spaces only once on initial setup if not already present or deleted
    const isSeedInitialized = localStorage.getItem(SEEDED_KEY);
    if (!isSeedInitialized) {
      localStorage.setItem(SEEDED_KEY, 'true');
      for (const def of DEFAULT_FRIEND_SPACES) {
        const defId = def.roomId.toLowerCase().trim();
        if (!seenIds.has(defId) && !deletedSpaces.includes(defId)) {
          seenIds.add(defId);
          sanitizedList.push({
            ...def,
            roomId: defId,
          });
        }
      }
    }

    sanitizedList.sort((a, b) => (b.lastVisitedAt || 0) - (a.lastVisitedAt || 0));

    // Persist sanitized, strictly deduplicated list back to localStorage
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(sanitizedList));

    return sanitizedList;
  } catch (err) {
    console.error('Failed to read saved spaces registry:', err);
    return [];
  }
}

/**
 * Save or update a space in the registry when created, joined, or visited.
 */
export function recordSpaceVisit(config: CoupleSpaceConfig): SavedSpaceRecord[] {
  try {
    const current = getSavedSpaces();
    const isFriends = config.spaceType === 'friends';
    const title = isFriends
      ? (config.groupName || 'Squad Room')
      : (config.partnerName || 'Couple Sanctuary');
    
    const partnerOrGroupName = isFriends
      ? (config.groupName || 'Friends Squad')
      : (config.partnerName || 'Partner');
      
    const partnerOrGroupAvatar = isFriends
      ? (config.groupEmoji || '🎉')
      : (config.partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

    const normRoomId = config.roomId.trim().toLowerCase();
    const updatedRecord: SavedSpaceRecord = {
      roomId: normRoomId,
      passkey: config.passkey.trim(),
      spaceType: (config.spaceType || 'couple') as SpaceType,
      title,
      partnerOrGroupName,
      partnerOrGroupAvatar,
      myRole: config.userRole || 'partner1',
      myName: config.userName || 'You',
      myAvatar: config.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      lastVisitedAt: Date.now(),
    };

    // Filter out existing record with same roomId (case-insensitive) and keep rest deduplicated
    const seen = new Set<string>([normRoomId]);
    const rest: SavedSpaceRecord[] = [];
    for (const s of current) {
      if (!s || !s.roomId) continue;
      const sId = s.roomId.toLowerCase().trim();
      if (!seen.has(sId)) {
        seen.add(sId);
        rest.push({ ...s, roomId: sId });
      }
    }

    const newList = [updatedRecord, ...rest];
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(newList));
    return newList;
  } catch (err) {
    console.error('Failed to record space visit:', err);
    return getSavedSpaces();
  }
}

/**
 * Remove a space from the registry if user explicitly deletes it from their list.
 */
export function removeSavedSpace(roomId: string): SavedSpaceRecord[] {
  try {
    const current = getSavedSpaces();
    const updated = current.filter((s) => s.roomId.toLowerCase() !== roomId.toLowerCase());
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove space from registry:', err);
    return getSavedSpaces();
  }
}

/**
 * Permanently delete a spouse sanctuary space:
 * - Marks the space in haven_deleted_spaces
 * - Removes from saved spaces list
 * - Erases cached messages and media history
 * - If it matches current active space, clears haven_couple_config
 */
export function deleteSpouseSpace(roomId: string): SavedSpaceRecord[] {
  if (!roomId) return getSavedSpaces();
  const normalized = roomId.toLowerCase().trim();
  try {
    markSpaceAsDeleted(normalized);
    deleteMessagesForSpace(normalized);
    const current = getSavedSpaces();
    const updated = current.filter((s) => s.roomId.toLowerCase().trim() !== normalized);
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(updated));

    // Check if current active couple config matches this room
    try {
      const activeRaw = localStorage.getItem('haven_couple_config');
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw);
        if (parsed.roomId && parsed.roomId.toLowerCase().trim() === normalized) {
          localStorage.removeItem('haven_couple_config');
        }
      }
    } catch {
      // ignore
    }

    return updated;
  } catch (err) {
    console.error('Failed to permanently delete spouse space:', err);
    return getSavedSpaces();
  }
}

/**
 * Permanently delete a group or friend space:
 * - Marks the space in haven_deleted_spaces so it will never be auto-seeded or re-shown
 * - Removes from saved spaces list
 * - Erases cached chat messages and media history
 */
export function deleteSavedSpace(roomId: string): SavedSpaceRecord[] {
  if (!roomId) return getSavedSpaces();
  const normalized = roomId.toLowerCase().trim();
  try {
    markSpaceAsDeleted(normalized);
    deleteMessagesForSpace(normalized);
    const current = getSavedSpaces();
    const updated = current.filter((s) => s.roomId.toLowerCase().trim() !== normalized);
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to permanently delete saved space:', err);
    return getSavedSpaces();
  }
}

/**
 * Permanently remove oneself from a group:
 * - Marks space as departed/deleted on this client
 * - Erases messages and removes from saved spaces list
 */
export function leaveSavedGroup(roomId: string): SavedSpaceRecord[] {
  if (!roomId) return getSavedSpaces();
  const normalized = roomId.toLowerCase().trim();
  try {
    markSpaceAsDeleted(normalized);
    deleteMessagesForSpace(normalized);
    const current = getSavedSpaces();
    const updated = current.filter((s) => s.roomId.toLowerCase().trim() !== normalized);
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to leave group space:', err);
    return getSavedSpaces();
  }
}

/**
 * Delete cached messages for a space from local storage.
 */
export function deleteMessagesForSpace(roomId: string): void {
  if (!roomId) return;
  const normalized = roomId.toLowerCase().trim();
  try {
    localStorage.removeItem(`haven_messages_${normalized}`);
  } catch (err) {
    console.warn('Could not delete cached messages for room:', roomId, err);
  }
}

/**
 * Clear all saved spaces from device local storage.
 */
export function clearAllSavedSpaces(): SavedSpaceRecord[] {
  try {
    localStorage.removeItem(SAVED_SPACES_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear saved spaces:', err);
    return [];
  }
}

/**
 * Convert a SavedSpaceRecord back into an active CoupleSpaceConfig.
 */
export function spaceRecordToConfig(record: SavedSpaceRecord): CoupleSpaceConfig {
  return {
    roomId: record.roomId,
    passkey: record.passkey,
    spaceType: record.spaceType,
    groupName: record.spaceType === 'friends' ? record.title : undefined,
    groupEmoji: record.spaceType === 'friends' ? record.partnerOrGroupAvatar : '💖',
    userRole: record.myRole,
    userName: record.myName,
    userAvatar: record.myAvatar,
    partnerName: record.partnerOrGroupName,
    partnerAvatar: record.partnerOrGroupAvatar,
    autoDeleteTimer: 0,
    isVerified: false,
  };
}

/**
 * Update the last message snippet and timestamp for a saved space.
 */
export function updateSpaceLastMessage(
  roomId: string,
  lastMessageText: string,
  lastMessageTime: number = Date.now()
): SavedSpaceRecord[] {
  try {
    const spaces = getSavedSpaces();
    const updated = spaces.map((s) => {
      if (s.roomId.toLowerCase() === roomId.toLowerCase()) {
        return {
          ...s,
          lastMessageText: lastMessageText.slice(0, 100),
          lastMessageTime,
          lastVisitedAt: Date.now(),
        };
      }
      return s;
    });
    localStorage.setItem(SAVED_SPACES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to update last message for space:', err);
    return getSavedSpaces();
  }
}

/**
 * Save chat messages for a specific space in local storage.
 */
export function saveMessagesForSpace(roomId: string, messages: any[]): void {
  if (!roomId) return;
  try {
    localStorage.setItem(`haven_messages_${roomId.toLowerCase()}`, JSON.stringify(messages));
    localStorage.setItem('haven_messages_history', JSON.stringify(messages));
  } catch (e) {
    console.warn('Could not cache messages for room:', roomId, e);
  }
}

/**
 * Retrieve saved chat messages for a space.
 */
export function getMessagesForSpace(roomId: string): any[] {
  if (!roomId) return [];
  const normalized = roomId.toLowerCase();
  try {
    const raw = localStorage.getItem(`haven_messages_${normalized}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not parse cached messages for room:', roomId, e);
  }

  // Pre-fill initial sample messages for default friend spaces
  if (normalized.includes('squad-hangout')) {
    const squadMsgs = [
      {
        id: 'squad-m1',
        roomId: normalized,
        senderId: 'user-maya',
        senderName: 'Maya',
        type: 'text',
        content: 'Hey squad! So awesome we are all in one space together 🎉',
        timestamp: Date.now() - 3600000 * 4,
      },
      {
        id: 'squad-m2',
        roomId: normalized,
        senderId: 'user-omar',
        senderName: 'Omar',
        type: 'text',
        content: "Who's ready for movie watch party or couple games tonight? 🍿",
        timestamp: Date.now() - 3600000 * 2,
      },
    ];
    saveMessagesForSpace(normalized, squadMsgs);
    return squadMsgs;
  }

  if (normalized.includes('maya-bestie')) {
    const mayaMsgs = [
      {
        id: 'maya-m1',
        roomId: normalized,
        senderId: 'user-maya',
        senderName: 'Maya',
        type: 'text',
        content: 'Hey! Love that we can chat right here alongside your spouse chat! 😊',
        timestamp: Date.now() - 3600000 * 6,
      },
      {
        id: 'maya-m2',
        roomId: normalized,
        senderId: 'user-maya',
        senderName: 'Maya',
        type: 'text',
        content: "Sent you the playlist link! Let's listen together in the lounge 🎶",
        timestamp: Date.now() - 3600000 * 5,
      },
    ];
    saveMessagesForSpace(normalized, mayaMsgs);
    return mayaMsgs;
  }

  if (normalized.includes('alex-rivera')) {
    const alexMsgs = [
      {
        id: 'alex-m1',
        roomId: normalized,
        senderId: 'user-alex',
        senderName: 'Alex',
        type: 'text',
        content: 'Great game of chess earlier! Rematch soon ♟️',
        timestamp: Date.now() - 3600000 * 24,
      },
    ];
    saveMessagesForSpace(normalized, alexMsgs);
    return alexMsgs;
  }

  return [];
}

/**
 * Export all saved chats across all spaces as a JSON backup payload.
 */
export function exportAllChatsData(): {
  exportedAt: string;
  spaces: Array<SavedSpaceRecord & { messages: any[] }>;
} {
  const spaces = getSavedSpaces();
  const fullData = spaces.map((space) => {
    const msgs = getMessagesForSpace(space.roomId);
    return {
      ...space,
      messages: msgs,
    };
  });
  return {
    exportedAt: new Date().toISOString(),
    spaces: fullData,
  };
}
