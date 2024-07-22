/* eslint-disable import/prefer-default-export */
import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

import offers from '@api/offer/index'
import asyncThunkErrorHandler from '@utils/asyncThunkErrorHandler'

export const getOffers = createAsyncThunk(
  'offers/getOffers',
  async (arg, { signal, rejectWithValue }) => {
    try {
      const source = axios.CancelToken.source()
      signal.addEventListener('abort', () => {
        source.cancel('Request Aborted due to component unmount.')
      })

      const response = await offers.getOffers(source.token)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      return asyncThunkErrorHandler(err, rejectWithValue)
    }
  }
)

export default { getOffers }
