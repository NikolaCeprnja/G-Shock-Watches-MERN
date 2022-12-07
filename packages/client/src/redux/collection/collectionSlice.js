import { createSlice, createDraftSafeSelector } from '@reduxjs/toolkit'

import * as collectionThunk from './collectionThunk'

const initialState = {
  loading: false,
  men: { loading: false, data: undefined },
  women: { loading: false, data: undefined },
}

export const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {},
  extraReducers: {
    [collectionThunk.getCollections.pending]: state => {
      state.loading = true
    },
    [collectionThunk.getCollections.fulfilled]: (
      state,
      { payload: { collections: allCollections } }
    ) => {
      state.loading = false

      if (!state.men.data) {
        state.men.data = []
      }

      if (!state.women.data) {
        state.women.data = []
      }

      allCollections.forEach(collection => {
        state[collection.gender].data = [
          ...new Map(
            [...state[collection.gender].data, collection].map(coll => [
              coll.id,
              coll,
            ])
          ).values(),
        ]
      })
    },
    [collectionThunk.getCollections.rejected]: state => {
      state.loading = false
    },
    [collectionThunk.getCollectionsByGender.pending]: (
      state,
      { meta: { arg } }
    ) => {
      state[arg].loading = true
    },
    [collectionThunk.getCollectionsByGender.fulfilled]: (
      state,
      { meta: { arg }, payload }
    ) => {
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
    [collectionThunk.getCollectionsByGender.rejected]: (
      state,
      { meta: { arg } }
    ) => {
      state[arg].loading = false
    },
  },
})

export const selectCollections = state => state.collections

export const selectCollectionByGender = gender =>
  createDraftSafeSelector(
    [selectCollections],
    allCollections => allCollections[gender]
  )

export default collectionSlice.reducer
