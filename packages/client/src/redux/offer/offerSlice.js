import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import offers from '@api/offer/index'

// Thunks
export const getOffers = createAsyncThunk('offers/getOffers', async () => {
  try {
    const response = await offers.getOffers()
    console.log(response)
    const { data, status } = response
    return { ...data, status }
  } catch (err) {
    console.log(err.response)
    return err.response
  }
})

const initialState = {
  loading: false,
  data: undefined,
}

export const offerSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {},
  extraReducers: {
    [getOffers.pending]: state => {
      state.loading = true
    },
    [getOffers.fulfilled]: (state, { payload }) => {
      state.loading = false
      state.data = payload.offers
    },
    [getOffers.rejected]: state => {
      state.loading = false
    },
  },
})

export const selectOffers = state => state.offers

export default offerSlice.reducer
