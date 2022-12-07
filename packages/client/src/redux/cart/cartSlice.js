import { createSlice, createDraftSafeSelector } from '@reduxjs/toolkit'

const initialState = {
  items: undefined,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, { payload }) => {
      if (!state.items) {
        state.items = [{ ...payload, quantity: 1 }]
        return
      }

      const existingItemIdx = state.items.findIndex(
        item => item.id === payload.id
      )

      if (existingItemIdx !== -1) {
        state.items[existingItemIdx].quantity += 1
      } else {
        state.items.push({ ...payload, quantity: 1 })
      }
    },
    removeItem: (state, { payload: { id, removeAll } }) => {
      const existingItem = state.items.find(item => item.id === id)

      if (existingItem.quantity === 1 || removeAll) {
        state.items = state.items.filter(item => item.id !== id)
        return
      }

      existingItem.quantity -= 1
    },
    removeAll: () => initialState,
  },
})

const selectCart = state => state.cart

export const selectCartItems = createDraftSafeSelector(
  [selectCart],
  cart => cart.items
)

export const selectCartItemCount = id =>
  createDraftSafeSelector(
    [selectCartItems],
    cartItems => cartItems?.find(item => item.id === id)?.quantity ?? 0
  )

export const selectCartItemsCount = createDraftSafeSelector(
  [selectCartItems],
  cartItems =>
    cartItems?.reduce(
      (accumulatedTotal, cartItem) => accumulatedTotal + cartItem.quantity,
      0
    ) ?? 0
)

export const selectCartItemsSubtotal = createDraftSafeSelector(
  [selectCartItems],
  cartItems =>
    cartItems?.reduce(
      (accumulatedSubtotal, cartItem) =>
        accumulatedSubtotal +
        cartItem.quantity *
          (cartItem.price -
            (cartItem.discount === undefined ? 0 : cartItem.discount / 100) *
              cartItem.price),
      0
    ) ?? 0
)

export const { addItem, removeItem, removeAll } = cartSlice.actions

export default cartSlice.reducer
