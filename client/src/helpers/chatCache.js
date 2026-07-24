/**
 * chatCache.js — Persistent localStorage cache layer
 * Implements stale-while-revalidate: instantly hydrate UI from cache,
 * then silently merge fresh server data in background.
 */

const CONVERSATIONS_KEY = 'chatapp_conversations'
const MESSAGES_PREFIX = 'chatapp_msgs_'
const MAX_CACHED_MESSAGES = 30

/**
 * Save conversation list to localStorage
 */
export function cacheConversations(conversations) {
  try {
    // Strip heavy fields to keep storage lean
    const lean = conversations.map(c => ({
      _id: c._id,
      sender: c.sender,
      receiver: c.receiver,
      isGroup: c.isGroup,
      groupName: c.groupName,
      participants: c.participants,
      userDetails: c.userDetails,
      lastMsg: c.lastMsg,
      unseenMsg: c.unseenMsg
    }))
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(lean))
  } catch (e) {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Load cached conversation list
 */
export function loadCachedConversations() {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Save messages for a specific chat (keep last 30)
 */
export function cacheMessages(chatId, messages) {
  try {
    const trimmed = messages.slice(-MAX_CACHED_MESSAGES)
    localStorage.setItem(MESSAGES_PREFIX + chatId, JSON.stringify(trimmed))
  } catch (e) {
    // silently ignore
  }
}

/**
 * Load cached messages for a specific chat
 */
export function loadCachedMessages(chatId) {
  try {
    const raw = localStorage.getItem(MESSAGES_PREFIX + chatId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Clear all chat caches (used on logout)
 */
export function clearAllChatCache() {
  try {
    localStorage.removeItem(CONVERSATIONS_KEY)
    // Remove all message caches
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(MESSAGES_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (e) {
    // silently ignore
  }
}
