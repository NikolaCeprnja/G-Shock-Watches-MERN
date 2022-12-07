import { createAsyncThunk } from '@reduxjs/toolkit'

import products from '@api/product/index'

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (urlQueryParams, { rejectWithValue }) => {
    try {
      const response = await products.getProducts(urlQueryParams)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const getLatestProducts = createAsyncThunk(
  'products/getLatestProducts',
  async () => {
    try {
      const response = await products.getLatestProducts()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return err.response
    }
  }
)

export const getTopRatedProducts = createAsyncThunk(
  'products/getTopRatedProducts',
  async () => {
    try {
      const response = await products.getTopRatedProducts()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return err.response
    }
  }
)

export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (pid, { rejectWithValue }) => {
    try {
      const response = await products.getProductById(pid)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

// TODO: Add getProductReviews async thunk

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ pid, updatedData }, { rejectWithValue }) => {
    try {
      const response = await products.updateProduct(pid, updatedData)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)
