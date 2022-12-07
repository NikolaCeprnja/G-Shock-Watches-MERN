import { createAsyncThunk } from '@reduxjs/toolkit'

import auth from '@api/user/auth'
import users from '@api/user/index'
import { getOrdersByUserId } from '@api/order/index'

export const signin = createAsyncThunk(
  'users/signin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await auth.signin(userData)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const signup = createAsyncThunk(
  'users/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await auth.signup(userData)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const signout = createAsyncThunk(
  'users/signout',
  async (user, { rejectWithValue }) => {
    try {
      const response = await auth.signout()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const authUser = createAsyncThunk(
  'users/auth',
  async (user, { rejectWithValue }) => {
    try {
      const response = await auth.authUser()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const getUsers = createAsyncThunk(
  'users/getUsers',
  async (urlQueryParams, { rejectWithValue }) => {
    try {
      const response = await users.getUsers(urlQueryParams)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (uid, { rejectWithValue }) => {
    try {
      const response = await users.getUserById(uid)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const getPurchasedProductsAndReviews = createAsyncThunk(
  'users/getPurchasedProductsAndReviews',
  async ({ uid, cancelToken }, { rejectWithValue }) => {
    try {
      const response = await users.getPurchasedProductsAndReviews(
        uid,
        cancelToken.token
      )
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      if (!err.response) {
        return rejectWithValue({ message: err.message, status: 'ABORTED' })
      }

      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const getUserOrders = createAsyncThunk(
  'users/getUserOrders',
  async ({ uid, cancelToken }, { rejectWithValue }) => {
    try {
      const response = await getOrdersByUserId(uid, cancelToken.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ uid, updatedData }, { rejectWithValue }) => {
    try {
      const response = await users.updateUser(uid, updatedData)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const updateReview = createAsyncThunk(
  'users/updateReview',
  async ({ rid, updatedData }, { rejectWithValue }) => {
    try {
      const response = await users.updateReview(rid, updatedData)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const deleteReview = createAsyncThunk(
  'users/deleteReview',
  async ({ rid }, { rejectWithValue }) => {
    try {
      const response = await users.deleteReview(rid)
      const { data, status } = response
      const {
        message,
        deletedReview: { id: reviewId, product: productId },
      } = data
      return { reviewId, productId, status, message }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ ...data, status, statusText })
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (uid, { rejectWithValue }) => {
    try {
      const response = await users.deleteUser(uid)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ ...data, status, statusText })
    }
  }
)
