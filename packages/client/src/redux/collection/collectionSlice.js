import {
  createSlice,
  createAsyncThunk,
  createDraftSafeSelector,
} from '@reduxjs/toolkit'

import collections from '@api/collection/index'

// Thunks
export const getCollectionsByGender = createAsyncThunk(
  'collections/getCollectionByGender',
  async gender => {
    try {
      const response = await collections.getCollectionsByGender(gender)
      console.log(response)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      console.log(err.response)
      return err.response
    }
  }
)

const initialState = {
  men: { loading: false, data: undefined },
  women: { loading: false, data: undefined },
}

export const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {},
  extraReducers: {
    [getCollectionsByGender.pending]: (state, { meta: { arg } }) => {
      state[arg].loading = true
    },
    [getCollectionsByGender.fulfilled]: (state, { meta: { arg }, payload }) => {
      state[arg].loading = false

      if (!state[arg].data) {
        state[arg].data = []
      }

      state[arg].data = [
        ...new Map(
          [...state[arg].data, ...payload.collections].map(collection => [
            collection.id,
            collection,
          ])
        ).values(),
      ]
    },
    [getCollectionsByGender.rejected]: (state, { meta: { arg } }) => {
      state[arg].loading = false
    },
  },
})

const selectCollections = state => state.collections

export const selectCollectionByGender = gender =>
  createDraftSafeSelector(
    [selectCollections],
    allCollections => allCollections[gender]
  )

export default collectionSlice.reducer
