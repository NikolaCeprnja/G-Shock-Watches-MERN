import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/users',
  headers: { 'Content-Type': 'application/json' },
})

const getUsers = async urlQueryParams => {
  const response = await axios({ params: urlQueryParams })
  return response
}

export const getTotalUsersCount = async () => {
  const response = await axios('/count')
  return response
}

const getUserById = async uid => {
  const response = await axios(`/${uid}`)
  return response
}

const getPurchasedProductsAndReviews = async (uid, cancelToken) => {
  const response = await axios(`/${uid}/purchased-products`, { cancelToken })
  return response
}

const updateUser = async (uid, data) => {
  const response = await axios.put(`/${uid}`, data)
  return response
}

export const deleteUser = async uid => {
  const response = await axios.delete(`/${uid}`)
  return response
}

const createReview = async (pid, data) => {
  const response = await axios.post(`/products/${pid}`, data, {
    baseURL: '/api/reviews',
  })
  return response
}

const updateReview = async (rid, data) => {
  const response = await axios.put(`/${rid}`, data, { baseURL: '/api/reviews' })
  return response
}

const deleteReview = async rid => {
  const response = await axios.delete(`/${rid}`, { baseURL: '/api/reviews' })
  return response
}

export default {
  getUsers,
  getUserById,
  getPurchasedProductsAndReviews,
  updateUser,
  createReview,
  updateReview,
  deleteReview,
  deleteUser,
}
