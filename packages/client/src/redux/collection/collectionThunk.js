import { createAsyncThunk } from '@reduxjs/toolkit'

import collections from '@api/collection/index'

// Thunks
export const getCollections = createAsyncThunk(
  'collections/getCollections',
  async (arg, { rejectWithValue }) => {
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
  async (arg, { rejectWithValue }) => {
    let gender

    if (typeof arg === 'string') {
      gender = arg
    } else if (typeof arg === 'object') {
      ;({ gender } = arg)
    }

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
