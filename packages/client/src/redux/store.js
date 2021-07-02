import { configureStore } from '@reduxjs/toolkit'

import userReducer from './user/userSlice'
import collectionReducer from './collection/collectionSlice'
import offerReducer from './offer/offerSlice'
import productReducer from './product/productSlice'
import notificationReducer from './notification/notificationSlice'
import cartReducer from './cart/cartSlice'

export default configureStore({
  reducer: {
    user: userReducer,
    collections: collectionReducer,
    offers: offerReducer,
    products: productReducer,
    notifications: notificationReducer,
    cart: cartReducer,
  },
})
