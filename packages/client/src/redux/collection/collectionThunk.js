import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

import collections from '@api/collection/index'
import asyncThunkErrorHandler from '@utils/asyncThunkErrorHandler'

export const getCollections = createAsyncThunk(
  'collections/getCollections',
  async (arg, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await collections.getCollections(source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export const getCollectionsByGender = createAsyncThunk(
  'collections/getCollectionByGender',
  async (arg, { signal, rejectWithValue }) => {
    let gender

    if (typeof arg === 'string') {
      gender = arg
    } else if (typeof arg === 'object') {
      ;({ gender } = arg)
    }

    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await collections.getCollectionsByGender(
        gender,
        source.token
      )
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)
