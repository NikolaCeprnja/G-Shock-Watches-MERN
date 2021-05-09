import { configureStore } from '@reduxjs/toolkit'

import userReducer from './user/userSlice'
import collectionReducer from './collection/collectionSlice'

export default configureStore({
  reducer: {
    user: userReducer,
    collections: collectionReducer,
  },
})
