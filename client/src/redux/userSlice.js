import { createSlice } from '@reduxjs/toolkit'
import { loadCachedConversations, loadCachedMessages, cacheConversations, cacheMessages, clearAllChatCache } from '../helpers/chatCache'

// ── Stale-While-Revalidate: hydrate from localStorage on boot ──
const cachedConversations = loadCachedConversations()

const initialState = {
  _id : "",
  name : "",
  email : "",
  profile_pic : "",
  token : "",
  onlineUser : [],
  socketConnection : null,
  chatCache: {}, // Runtime cache: { [userId]: messagesArray }
  conversations: cachedConversations // Hydrate sidebar instantly from localStorage
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser : (state,action)=>{
        state._id = action.payload._id
        state.name = action.payload.name 
        state.email = action.payload.email 
        state.profile_pic = action.payload.profile_pic 
    },
    setToken : (state,action)=>{
        state.token = action.payload
    },
    logout : (state,action)=>{
        state._id = ""
        state.name = ""
        state.email = ""
        state.profile_pic = ""
        state.token = ""
        state.socketConnection = null
        state.chatCache = {}
        state.conversations = []
        clearAllChatCache()
    },
    setOnlineUser : (state,action)=>{
      state.onlineUser = action.payload
    },
    setSocketConnection : (state,action)=>{
      state.socketConnection = action.payload
    },
    setChatCache: (state, action) => {
      const { chatId, messages } = action.payload
      const trimmed = messages.slice(-30)
      state.chatCache[chatId] = trimmed
      // Persist to localStorage
      cacheMessages(chatId, trimmed)
    },
    setConversations: (state, action) => {
      state.conversations = action.payload
      // Persist to localStorage for instant load on refresh
      cacheConversations(action.payload)
    },
    appendChatMessage: (state, action) => {
      const { chatId, message } = action.payload
      if (!state.chatCache[chatId]) {
        state.chatCache[chatId] = []
      }
      // Prevent duplicate messages (optimistic UI may have already added it)
      const exists = state.chatCache[chatId].some(m => m._id === message._id)
      if (!exists) {
        state.chatCache[chatId].push(message)
        // Trim to last 30
        if (state.chatCache[chatId].length > 30) {
          state.chatCache[chatId] = state.chatCache[chatId].slice(-30)
        }
      }
      cacheMessages(chatId, state.chatCache[chatId])
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUser, setToken ,logout, setOnlineUser,setSocketConnection, setChatCache, setConversations, appendChatMessage } = userSlice.actions

export default userSlice.reducer