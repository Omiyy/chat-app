import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Socket.io instance is intentionally stored here — ignore it
        ignoredPaths: ['user.socketConnection'],
        ignoredActions: ['user/setSocketConnection'],
      },
    }),
})