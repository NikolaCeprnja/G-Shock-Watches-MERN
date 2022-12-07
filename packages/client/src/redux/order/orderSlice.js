/* eslint-disable no-unused-vars */
import { createSlice, createDraftSafeSelector } from '@reduxjs/toolkit'

import * as orderThunk from '@redux/order/orderThunk'

const initialState = {
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
    data: undefined,
  },
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderPreview: ({ preview }) => {
      preview.data = undefined
    },
  },
  extraReducers: {
    [orderThunk.getOrders.pending]: ({ all }) => {
      all.loading = true
    },
    [orderThunk.getOrders.fulfilled]: (
      { all },
      { payload: { orders: allOrders, curPage, pageSize, totalOrders } }
    ) => {
      all.loading = false
      all.data = allOrders
      all.curPage = curPage
      all.pageSize = pageSize
      all.totalData = totalOrders
    },
    [orderThunk.getOrders.rejected]: ({ all }) => {
      all.loading = false
      all.data = undefined
      all.curPage = undefined
      all.pageSize = undefined
      all.totalData = undefined
    },
    [orderThunk.getOrderById.pending]: ({ preview }) => {
      preview.loading = true
    },
    [orderThunk.getOrderById.fulfilled]: (
      { preview },
      { payload: { order } }
    ) => {
      preview.loading = false
      preview.data = order
    },
    [orderThunk.getOrderById.rejected]: ({ preview }) => {
      preview.loading = false
      preview.updating = false
      preview.data = undefined
    },
  },
})

const selectOrders = state => state.orders

export const selectAllOrders = createDraftSafeSelector(
  [selectOrders],
  allOrders => allOrders.all
)

export const selectOrdersByType = type =>
  createDraftSafeSelector([selectOrders], allOrders => allOrders[type])

export const { clearOrderPreview } = orderSlice.actions

export default orderSlice.reducer
