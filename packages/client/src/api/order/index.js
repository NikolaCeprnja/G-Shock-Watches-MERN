import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/orders',
  headers: { 'Content-Type': 'application/json' },
})

const getOrders = async urlQueryParams => {
  const response = await axios({ params: urlQueryParams })
  return response
}

export const getTotalOrdersCount = async () => {
  const response = await axios('/count')
  return response
}

export const getTotalOrdersSales = async urlQueryParams => {
  const response = await axios('/total-sales', { params: urlQueryParams })
  return response
}

const getOrderById = async oid => {
  const response = await axios(`/${oid}`)
  return response
}

export const getOrdersByUserId = async uid => {
  const response = await axios(`/users/${uid}`)
  return response
}

export const createNewOrder = async data => {
  const response = await axios.post('/create', data)
  return response
}

export default {
  getOrders,
  getOrderById,
  getOrdersByUserId,
  createNewOrder,
}
