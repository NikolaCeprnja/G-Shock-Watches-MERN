/* eslint-disable no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit'

import orders from '@api/order/index'

export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (urlQueryParams, { rejectWithValue }) => {
    try {
      const response = await orders.getOrders(urlQueryParams)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (oid, { rejectWithValue }) => {
    try {
      const response = await orders.getOrderById(oid)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)
