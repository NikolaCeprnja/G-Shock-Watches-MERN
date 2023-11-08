import { createSlice, createDraftSafeSelector } from '@reduxjs/toolkit'

import * as collectionThunk from './collectionThunk'

const initialState = {
  loading: false,
  men: { loading: false, data: undefined },
  women: { loading: false, data: undefined },
}

const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    toggleSelectedCollections: (state, { payload }) => {
      const { gender, value: currentlySelectedCollections } = payload
      const selectedCollections = state[gender]
      let isCurrentlySelected

      selectedCollections.data?.forEach(collection => {
        if (Array.isArray(currentlySelectedCollections)) {
          isCurrentlySelected = currentlySelectedCollections.includes(
            collection.name
          )
        } else if (typeof currentlySelectedCollections === 'string') {
          isCurrentlySelected = currentlySelectedCollections === collection.name
        }

        if (!collection.selected && isCurrentlySelected) {
          collection.selected = true
          return
        }

        if (collection.selected && !isCurrentlySelected) {
          delete collection.selected
        }
      })
    },
    resetSelectedCollections: (state, { payload: { gender = 'all' } }) => {
      if (gender === 'all') {
        return [...(state.men.data ?? []), ...(state.women.data ?? [])].forEach(
          coll => coll.selected && delete coll.selected
        )
      }

      return state[gender].data?.forEach(
        coll => coll.selected && delete coll.selected
      )
    },
  },
  extraReducers: {
    [collectionThunk.getCollections.pending]: state => {
      state.loading = true
    },
    [collectionThunk.getCollections.fulfilled]: (
      state,
      {
        meta: { arg: urlQueryParams = [] },
        payload: { collections: allCollections },
      }
    ) => {
      state.loading = false

      if (!state.men.data) {
        state.men.data = []
      }

      if (!state.women.data) {
        state.women.data = []
      }

      allCollections.forEach(collection => {
        if (Array.isArray(urlQueryParams) && urlQueryParams.length > 0) {
          if (urlQueryParams.includes(collection.name)) {
            collection.selected = true
          }
        } else if (typeof urlQueryParams === 'string') {
          if (urlQueryParams === collection.name) {
            collection.selected = true
          }
        }

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
      let gender

      if (typeof arg === 'string') {
        gender = arg
      } else if (typeof arg === 'object') {
        ;({ gender } = arg)
      }

      state[gender].loading = true
    },
    [collectionThunk.getCollectionsByGender.fulfilled]: (
      state,
      { meta: { arg }, payload: { collections: fetchedCollections } }
    ) => {
      let gender
      let urlQueryParams = []

      if (typeof arg === 'string') {
        gender = arg
      } else if (typeof arg === 'object') {
        ;({ gender, urlQueryParams = [] } = arg)
      }

      state[gender].loading = false

      if (!state[gender].data) {
        state[gender].data = []
      }

      state[gender].data = [
        ...new Map(
          [...state[gender].data, ...fetchedCollections].map(collection => {
            if (Array.isArray(urlQueryParams) && urlQueryParams.length > 0) {
              if (urlQueryParams.includes(collection.name)) {
                collection.selected = true
              }
            } else if (typeof urlQueryParams === 'string') {
              if (urlQueryParams === collection.name) {
                collection.selected = true
              }
            }

            return [collection.id, collection]
          })
        ).values(),
      ]
    },
    [collectionThunk.getCollectionsByGender.rejected]: (
      state,
      { meta: { arg } }
    ) => {
      let gender

      if (typeof arg === 'string') {
        gender = arg
      } else if (typeof arg === 'object') {
        ;({ gender } = arg)
      }

      state[gender].loading = false
    },
  },
})

export const {
  toggleSelectedCollections,
  resetSelectedCollections,
} = collectionSlice.actions

export const selectCollections = state => state.collections

export const selectCollectionsByGender = gender =>
  createDraftSafeSelector(
    [selectCollections],
    allCollections => allCollections[gender]
  )

export const selectCurrentlySelectedCollections = () =>
  createDraftSafeSelector([selectCollections], allCollections =>
    []
      .concat(allCollections?.men?.data, allCollections?.women?.data)
      .filter(collection => collection?.selected)
      .map(({ name, gender }) => ({
        name,
        gender,
      }))
  )

export const selectCurrentlySelectedCollectionsByGender = gender =>
  createDraftSafeSelector(
    [selectCollectionsByGender(gender)],
    ({ data = [] }) =>
      data.filter(collection => collection?.selected).map(({ name }) => name)
  )

export default collectionSlice.reducer
