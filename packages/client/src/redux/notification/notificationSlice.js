import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loading: false,
  data: undefined,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    create: (state, { payload }) => {
      if (!state.data) {
        state.data = []
      }

      let exists = false

      state.data.forEach(notification => {
        if (notification.id === payload.id) {
          exists = true
          // eslint-disable-next-line no-useless-return
          return
        }
      })

      if (!exists) {
        state.data.push(payload)
      }
    },
    remove: (state, { payload }) => {
      state.data = state.data?.filter(
        notification => notification.id !== payload
      )
    },
    removeAll: () => initialState,
  },
})

export const selectNotifications = state => state.notifications

export const { create, remove, removeAll } = notificationSlice.actions

export default notificationSlice.reducer
