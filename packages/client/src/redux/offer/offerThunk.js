/* eslint-disable import/prefer-default-export */
import { createAsyncThunk } from '@reduxjs/toolkit'

import offers from '@api/offer/index'

export const getOffers = createAsyncThunk(
  'offers/getOffers',
  async (offer, { rejectWithValue }) => {
    try {
      const response = await offers.getOffers()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({ data, status, statusText })
    }
  }
)

export default { getOffers }
