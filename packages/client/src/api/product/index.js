import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/products',
  headers: { 'Content-Type': 'application/json' },
})

const getProducts = async urlQueryParams => {
  const response = await axios({ params: urlQueryParams })

  return response
}

export const getTotalProductsCount = async () => {
  const response = await axios('/count')
  return response
}

const getProductById = async pid => {
  const response = await axios(`/${pid}`)

  return response
}

const getLatestProducts = async () => {
  const response = await axios('/latest')

  return response
}

const getTopRatedProducts = async () => {
  const response = await axios('/top-rated')

  return response
}

const getProductReviews = async pid => {
  const response = await axios(`/products/${pid}`, { baseURL: '/api/reviews' })
  return response
}

export const createNewProduct = async data => {
  const response = await axios.post('/create', data)

  return response
}

const updateProduct = async (pid, data) => {
  const response = await axios.put(`/${pid}`, data)

  return response
}

export const deleteProduct = async pid => {
  const response = await axios.delete(`/${pid}`)

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
