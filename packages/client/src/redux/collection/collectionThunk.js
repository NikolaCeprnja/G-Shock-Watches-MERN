import { createAsyncThunk } from '@reduxjs/toolkit'

import collections from '@api/collection/index'

// Thunks
export const getCollections = createAsyncThunk(
  'collections/getCollections',
  async (collection, { rejectWithValue }) => {
    try {
      const response = await collections.getCollections()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export const getCollectionsByGender = createAsyncThunk(
  'collections/getCollectionByGender',
  async (gender, { rejectWithValue }) => {
    try {
      const response = await collections.getCollectionsByGender(gender)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)
