import {
  createSlice,
  createAsyncThunk,
  createDraftSafeSelector,
} from '@reduxjs/toolkit'

import products from '@api/product/index'

// Thunks
export const getLatestProducts = createAsyncThunk(
  'products/getLatestProducts',
  async () => {
    try {
      const response = await products.getLatestProducts()
      console.log(response)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      console.log(err)
      return err.response
    }
  }
)

export const getTopRatedProducts = createAsyncThunk(
  'products/getTopRatedProducts',
  async () => {
    try {
      const response = await products.getTopRatedProducts()
      console.log(response)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      console.log(err)
      return err.response
    }
  }
)

const initialState = {
  latest: {
    loading: false,
    data: undefined,
  },
  topRated: {
    loading: false,
    data: undefined,
  },
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: {
    [getLatestProducts.pending]: ({ latest }) => {
      latest.loading = true
    },
    [getLatestProducts.fulfilled]: (
      { latest },
      { payload: { latestProducts } }
    ) => {
      latest.loading = false
      latest.data = latestProducts
    },
    [getLatestProducts.rejected]: ({ latest }) => {
      latest.loading = false
    },
    [getTopRatedProducts.pending]: ({ topRated }) => {
      topRated.loading = true
    },
    [getTopRatedProducts.fulfilled]: (
      { topRated },
      { payload: { topRatedProducts } }
    ) => {
      topRated.loading = false
      topRated.data = topRatedProducts
    },
    [getTopRatedProducts.rejected]: ({ topRated }) => {
      topRated.loading = false
    },
  },
})

const selectProducts = state => state.products

export const selectProductByType = type =>
  createDraftSafeSelector([selectProducts], allProducts => allProducts[type])

export default productSlice.reducer
