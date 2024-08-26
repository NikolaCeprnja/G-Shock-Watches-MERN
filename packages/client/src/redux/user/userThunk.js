import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

import auth from '@api/user/auth'
import users from '@api/user/index'
import { getOrdersByUserId } from '@api/order/index'
import asyncThunkErrorHandler from '@utils/asyncThunkErrorHandler'

export const signin = createAsyncThunk(
  'users/signin',
  async ({ userData }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await auth.signin(userData, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const signup = createAsyncThunk(
  'users/signup',
  async ({ userData }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await auth.signup(userData, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const signout = createAsyncThunk(
  'users/signout',
  async (arg, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await auth.signout(source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const authUser = createAsyncThunk(
  'users/auth',
  async (arg, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await auth.authUser(source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getUsers = createAsyncThunk(
  'users/getUsers',
  async (params, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.getUsers(params, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (uid, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.getUserById(uid, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getPurchasedProductsAndReviews = createAsyncThunk(
  'users/getPurchasedProductsAndReviews',
  async ({ uid }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.getPurchasedProductsAndReviews(
        uid,
        source.token
      )
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getUserOrders = createAsyncThunk(
  'users/getUserOrders',
  async ({ uid }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await getOrdersByUserId(uid, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ uid, updatedData }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.updateUser(uid, updatedData, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const updateReview = createAsyncThunk(
  'users/updateReview',
  async ({ rid, updatedData }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.updateReview(rid, updatedData, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const deleteReview = createAsyncThunk(
  'users/deleteReview',
  async ({ rid }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.deleteReview(rid, source.token)
      const { data, status } = response
      const {
        message,
        deletedReview: { id: reviewId, product: productId },
      } = data
      return { reviewId, productId, status, message }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (uid, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await users.deleteUser(uid, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)
