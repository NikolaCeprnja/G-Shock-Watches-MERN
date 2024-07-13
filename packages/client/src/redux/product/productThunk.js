import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

import products from '@api/product/index'
import asyncThunkErrorHandler from '@utils/asyncThunkErrorHandler'

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await products.getProducts(params, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getLatestProducts = createAsyncThunk(
  'products/getLatestProducts',
  async (arg, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await products.getLatestProducts(source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getTopRatedProducts = createAsyncThunk(
  'products/getTopRatedProducts',
  async (arg, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await products.getTopRatedProducts(source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (pid, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await products.getProductById(pid, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ pid, updatedData }, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await products.updateProduct(
        pid,
        updatedData,
        source.token
      )
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)
