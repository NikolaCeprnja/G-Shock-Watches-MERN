import { createSlice } from '@reduxjs/toolkit'

import * as offerThunk from './offerThunk'

const initialState = {
  loading: false,
  data: undefined,
}

const offerSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {},
  extraReducers: {
    [offerThunk.getOffers.pending]: state => {
      state.loading = true
    },
    [offerThunk.getOffers.fulfilled]: (state, { payload }) => {
      state.loading = false
      state.data = payload.offers
    },
    [offerThunk.getOffers.rejected]: state => {
      state.loading = false
    },
  },
})

export const selectOffers = state => state.offers

export default offerSlice.reducer
