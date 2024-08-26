import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/users',
  headers: { 'Content-Type': 'application/json' },
})

const getUsers = async (params, cancelToken) => {
  const response = await axios({ params, cancelToken })
  return response
}

export const getTotalUsersCount = async cancelToken => {
  const response = await axios('/count', { cancelToken })
  return response
}

const getUserById = async (uid, cancelToken) => {
  const response = await axios(`/${uid}`, { cancelToken })
  return response
}

const getPurchasedProductsAndReviews = async (uid, cancelToken) => {
  const response = await axios(`/${uid}/purchased-products`, { cancelToken })
  return response
}

const updateUser = async (uid, data, cancelToken) => {
  const response = await axios.put(`/${uid}`, data, { cancelToken })
  return response
}

export const deleteUser = async (uid, cancelToken) => {
  const response = await axios.delete(`/${uid}`, { cancelToken })
  return response
}

const createReview = async (pid, data, cancelToken) => {
  const response = await axios.post(`/products/${pid}`, data, {
    baseURL: '/api/reviews',
    cancelToken,
  })
  return response
}

const updateReview = async (rid, data, cancelToken) => {
  const response = await axios.put(`/${rid}`, data, {
    baseURL: '/api/reviews',
    cancelToken,
  })
  return response
}

const deleteReview = async (rid, cancelToken) => {
  const response = await axios.delete(`/${rid}`, {
    baseURL: '/api/reviews',
    cancelToken,
  })
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
