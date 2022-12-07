import { createSlice, createDraftSafeSelector } from '@reduxjs/toolkit'

import * as productThunk from './productThunk'

const initialState = {
  all: {
    loading: false,
    data: undefined,
    curPage: undefined,
    pageSize: undefined,
    totalData: undefined,
  },
  latest: {
    loading: false,
    data: undefined,
  },
  topRated: {
    loading: false,
    data: undefined,
  },
  preview: {
    loading: false,
    updating: false,
    data: undefined,
  },
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductPreview: ({ preview }) => {
      preview.data = undefined
    },
  },
  extraReducers: {
    [productThunk.getProducts.pending]: ({ all }) => {
      all.loading = true
    },
    [productThunk.getProducts.fulfilled]: (
      { all },
      { payload: { products: allProducts, curPage, pageSize, totalProducts } }
    ) => {
      all.loading = false
      all.data = allProducts
      all.curPage = curPage
      all.pageSize = pageSize
      all.totalData = totalProducts
    },
    [productThunk.getProducts.rejected]: ({ all }) => {
      all.loading = false
      all.data = undefined
      all.curPage = undefined
      all.pageSize = undefined
      all.totalData = undefined
    },
    [productThunk.getLatestProducts.pending]: ({ latest }) => {
      latest.loading = true
    },
    [productThunk.getLatestProducts.fulfilled]: (
      { latest },
      { payload: { latestProducts } }
    ) => {
      latest.loading = false
      latest.data = latestProducts
    },
    [productThunk.getLatestProducts.rejected]: ({ latest }) => {
      latest.loading = false
    },
    [productThunk.getTopRatedProducts.pending]: ({ topRated }) => {
      topRated.loading = true
    },
    [productThunk.getTopRatedProducts.fulfilled]: (
      { topRated },
      { payload: { topRatedProducts } }
    ) => {
      topRated.loading = false
      topRated.data = topRatedProducts
    },
    [productThunk.getTopRatedProducts.rejected]: ({ topRated }) => {
      topRated.loading = false
    },
    [productThunk.getProductById.pending]: ({ preview }) => {
      preview.loading = true
    },
    [productThunk.getProductById.fulfilled]: (
      { preview },
      { payload: { product } }
    ) => {
      preview.loading = false
      preview.data = product
    },
    [productThunk.getProductById.rejected]: ({ preview }) => {
      preview.loading = false
    },
    [productThunk.updateProduct.pending]: ({ preview }) => {
      preview.updating = true
    },
    [productThunk.updateProduct.fulfilled]: (
      { preview },
      { payload: { updatedProduct } }
    ) => {
      preview.updating = false
      preview.data = updatedProduct
    },
    [productThunk.updateProduct.rejected]: ({ preview }) => {
      preview.updating = false
    },
  },
})

const selectProducts = state => state.products

export const selectAllProducts = createDraftSafeSelector(
  [selectProducts],
  allProducts => allProducts.all
)

export const selectProductsByType = type =>
  createDraftSafeSelector([selectProducts], allProducts => allProducts[type])

export const { clearProductPreview } = productSlice.actions

export default productSlice.reducer
