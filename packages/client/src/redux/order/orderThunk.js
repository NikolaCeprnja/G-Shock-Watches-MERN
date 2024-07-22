import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

import orders from '@api/order/index'
import asyncThunkErrorHandler from '@utils/asyncThunkErrorHandler'

export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (params, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await orders.getOrders(params, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (oid, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await orders.getOrderById(oid, source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)
