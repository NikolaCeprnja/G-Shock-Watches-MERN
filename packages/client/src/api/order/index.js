import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/orders',
  headers: { 'Content-Type': 'application/json' },
})

const getOrders = async (params, cancelToken) => {
  const response = await axios({ params, cancelToken })
  return response
}

export const getTotalOrdersCount = async cancelToken => {
  const response = await axios('/count', { cancelToken })
  return response
}

export const getTotalOrdersSales = async (cancelToken, params) => {
  const response = await axios('/total-sales', {
    params,
    cancelToken,
  })
  return response
}

const getOrderById = async (oid, cancelToken) => {
  const response = await axios(`/${oid}`, { cancelToken })
  return response
}

export const getOrdersByUserId = async (uid, cancelToken) => {
  const response = await axios(`/users/${uid}`, {
    cancelToken,
  })
  return response
}

export const createNewOrder = async (data, cancelToken) => {
  const response = await axios.post('/create', data, { cancelToken })
  return response
}

export default {
  getOrders,
  getOrderById,
  getOrdersByUserId,
  createNewOrder,
}
