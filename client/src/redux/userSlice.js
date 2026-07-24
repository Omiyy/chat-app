import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  _id : "",
  name : "",
  email : "",
  profile_pic : "",
  token : "",
  onlineUser : [],
  socketConnection : null,
  chatCache: {}, // Cache for messages: { [userId]: messagesArray }
  conversations: [] // Cache for sidebar conversation list
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
    },
    setOnlineUser : (state,action)=>{
      state.onlineUser = action.payload
    },
    setSocketConnection : (state,action)=>{
      state.socketConnection = action.payload
    },
    setChatCache: (state, action) => {
      const { chatId, messages } = action.payload
      state.chatCache[chatId] = messages
    },
    setConversations: (state, action) => {
      state.conversations = action.payload
    },
    appendChatMessage: (state, action) => {
      const { chatId, message } = action.payload
      if (state.chatCache[chatId]) {
        state.chatCache[chatId].push(message)
      } else {
        state.chatCache[chatId] = [message]
      }
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUser, setToken ,logout, setOnlineUser,setSocketConnection, setChatCache, setConversations, appendChatMessage } = userSlice.actions

export default userSlice.reducer