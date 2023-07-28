/* eslint-disable no-unused-vars */
import { createSlice, createDraftSafeSelector } from '@reduxjs/toolkit'

import * as userThunk from './userThunk'

const initialState = {
  loggedInUser: {
    auth: 'unauthenticated',
    loading: false,
    updating: false,
    info: undefined,
  },
  all: {
    loading: false,
    data: undefined,
    curPage: undefined,
    pageSize: undefined,
    totalData: undefined,
  },
  preview: {
    loading: false,
    updating: false,
    info: undefined,
  },
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserPreview: ({ preview }) => {
      preview.info = undefined
    },
  },
  extraReducers: {
    [userThunk.signin.pending]: ({ loggedInUser }) => {
      loggedInUser.loading = true
    },
    [userThunk.signin.fulfilled]: ({ loggedInUser }, { payload }) => {
      Object.assign(loggedInUser, {
        signedIn: true,
        auth: 'authenticated',
        loading: false,
        info: { ...payload.loggedInUser },
      })
    },
    [userThunk.signin.rejected]: ({ loggedInUser }) => {
      loggedInUser.loading = false
    },
    [userThunk.signup.pending]: ({ loggedInUser }) => {
      loggedInUser.loading = true
    },
    [userThunk.signup.fulfilled]: ({ loggedInUser }, { payload }) => {
      Object.assign(loggedInUser, {
        signedIn: true,
        auth: 'authenticated',
        loading: false,
        info: { ...payload.signedUpUser },
      })
    },
    [userThunk.signup.rejected]: ({ loggedInUser }) => {
      loggedInUser.loading = false
    },
    [userThunk.signout.fulfilled]: () => initialState,
    /*     [signout.rejected]: state => {
      state.loading = false
    }, */
    [userThunk.authUser.pending]: ({ loggedInUser }) => {
      loggedInUser.auth = 'authenticating'
    },
    [userThunk.authUser.fulfilled]: ({ loggedInUser }, { payload }) => {
      Object.assign(loggedInUser, {
        auth: 'authenticated',
        info: { ...payload.loggedInUser },
      })
    },
    [userThunk.authUser.rejected]: ({ loggedInUser }) => {
      loggedInUser.auth = 'unauthenticated'
    },
    [userThunk.getUsers.pending]: ({ all }) => {
      all.loading = true
    },
    [userThunk.getUsers.fulfilled]: (
      { all },
      { payload: { users: allUsers, curPage, pageSize, totalUsers } }
    ) => {
      all.loading = false
      all.data = allUsers
      all.curPage = curPage
      all.pageSize = pageSize
      all.totalData = totalUsers
    },
    [userThunk.getUsers.rejected]: ({ all }) => {
      all.loading = false
      all.data = undefined
      all.curPage = undefined
      all.pageSize = undefined
      all.totalData = undefined
    },
    [userThunk.getUserById.pending]: ({ preview }) => {
      preview.loading = true
    },
    [userThunk.getUserById.fulfilled]: ({ preview }, { payload: { user } }) => {
      preview.loading = false
      preview.info = user
    },
    [userThunk.getUserById.rejected]: ({ preview }) => {
      preview.loading = false
    },
    /* [userThunk.getPurchasedProductsAndReviews.pending]: ( state, { meta: { arg: { updateFor }, }, }) => {}, */
    [userThunk.getPurchasedProductsAndReviews.fulfilled]: (
      state,
      { payload: { purchasedProducts }, meta: { arg } }
    ) => {
      const { updateFor } = arg
      state[updateFor].info.purchasedProducts = purchasedProducts
    },
    /* [userThunk.getPurchasedProductsAndReviews.rejected]: ( state, { meta: { arg: { updateFor }, }, }) => {}, */
    // [userThunk.getUserOrders.pending]: () => {},
    [userThunk.getUserOrders.fulfilled]: (
      state,
      { payload: { orders }, meta: { arg } }
    ) => {
      const { updateFor } = arg
      state[updateFor].info.orders = orders
    },
    // [userThunk.getUserOrders.rejected]: () => {},
    [userThunk.updateUser.pending]: (state, { meta: { arg } }) => {
      const { updateFor } = arg
      state[updateFor].updating = true
    },
    [userThunk.updateUser.fulfilled]: (
      state,
      { payload: { updatedUser }, meta: { arg } }
    ) => {
      const { updateFor } = arg
      Object.assign(state[updateFor], {
        updating: false,
        info: { ...state[updateFor].info, ...updatedUser },
      })
    },
    [userThunk.updateUser.rejected]: (state, { meta: { arg } }) => {
      const { updateFor } = arg
      state[updateFor].updating = false
    },
    // [userThunk.updateReview.pending]: () => {},
    [userThunk.updateReview.fulfilled]: (
      state,
      { payload: { updatedReview }, meta: { arg } }
    ) => {
      const { updateFor } = arg
      const { id, productId, ...restData } = updatedReview
      const reviewToUpdate = state[updateFor].info.purchasedProducts
        ?.find(product => product.id === productId)
        .reviews?.find(review => review.id === id)

      Object.assign(reviewToUpdate, restData)
    },
    // [userThunk.updateReview.rejected]: () => {},
    // [userThunk.deleteReview.pending]: () => {},
    [userThunk.deleteReview.fulfilled]: (
      state,
      { meta: { arg }, payload: { productId, reviewId } }
    ) => {
      const { updateFor } = arg
      const { purchasedProducts } = state[updateFor].info
      const foundProduct = purchasedProducts?.find(
        product => product.id === productId
      )
      const reviews = foundProduct?.reviews?.filter(
        review => review.id !== reviewId
      )
      foundProduct.reviews = reviews
    },
    // [userThunk.deleteReview.rejected]: () => {},
    // [userThunk.deleteUser.pending]: () => {}
    [userThunk.deleteUser.fulfilled]: (state, action) => initialState,
    // [userThunk.deleteUser.rejected]: () => {}
  },
})

const selectUsers = state => state.users

export const selectLoggedInUser = createDraftSafeSelector(
  [selectUsers],
  allUsers => allUsers.loggedInUser
)

export const selectUserPreview = createDraftSafeSelector(
  [selectUsers],
  allUsers => allUsers.preview
)

export const selectAllUsers = createDraftSafeSelector(
  [selectUsers],
  allUsers => allUsers.all
)

export const { clearUserPreview } = userSlice.actions

export default userSlice.reducer
