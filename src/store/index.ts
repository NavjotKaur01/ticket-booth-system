import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit"

import { clubmanApi } from "@/store/api/clubmanApi"
import { authReducer, logout, switchLocation } from "@/store/slices/authSlice"

const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  actionCreator: logout,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(clubmanApi.util.resetApiState())
  },
})

listenerMiddleware.startListening({
  actionCreator: switchLocation,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(
      clubmanApi.util.invalidateTags([
        "SystemUser",
        "Customer",
        "Promotion",
        "Reservation",
        "ShowDetails",
        "RecentSales",
      ])
    )
  },
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [clubmanApi.reducerPath]: clubmanApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      clubmanApi.middleware,
      listenerMiddleware.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
