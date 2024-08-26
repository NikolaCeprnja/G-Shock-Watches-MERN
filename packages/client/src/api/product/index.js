import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/products',
  headers: { 'Content-Type': 'application/json' },
})

const getProducts = async (params, cancelToken) => {
  const response = await axios({ params, cancelToken })
  return response
}

export const getTotalProductsCount = async cancelToken => {
  const response = await axios('/count', { cancelToken })
  return response
}

const getProductById = async (pid, cancelToken) => {
  const response = await axios(`/${pid}`, { cancelToken })
  return response
}

const getLatestProducts = async cancelToken => {
  const response = await axios('/latest', { cancelToken })
  return response
}

const getTopRatedProducts = async cancelToken => {
  const response = await axios('/top-rated', { cancelToken })
  return response
}

const getProductReviews = async (pid, cancelToken) => {
  const response = await axios(`/products/${pid}`, {
    baseURL: '/api/reviews',
    cancelToken,
  })
  return response
}

export const createNewProduct = async (data, cancelToken) => {
  const response = await axios.post('/create', data, { cancelToken })
  return response
}

const updateProduct = async (pid, data, cancelToken) => {
  const response = await axios.put(`/${pid}`, data, { cancelToken })
  return response
}

export const deleteProduct = async (pid, cancelToken) => {
  const response = await axios.delete(`/${pid}`, { cancelToken })
  return response
}

export default {
  getProducts,
  getProductById,
  getLatestProducts,
  getTopRatedProducts,
  getProductReviews,
  updateProduct,
}
