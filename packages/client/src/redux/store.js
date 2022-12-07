import { configureStore, combineReducers } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistStore,
  persistReducer,
} from 'redux-persist'

import userReducer from './user/userSlice'
import collectionReducer from './collection/collectionSlice'
import offerReducer from './offer/offerSlice'
import productReducer from './product/productSlice'
import notificationReducer from './notification/notificationSlice'
import cartReducer from './cart/cartSlice'
import orderReducer from './order/orderSlice'

const rootReducer = combineReducers({
  users: userReducer,
  collections: collectionReducer,
  offers: offerReducer,
  products: productReducer,
  notifications: notificationReducer,
  cart: cartReducer,
  orders: orderReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

const persistor = persistStore(store)

export { store, persistor }
