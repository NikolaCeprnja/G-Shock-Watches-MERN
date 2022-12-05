import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/users/auth',
  headers: { 'Content-Type': 'application/json' },
})

const authUser = async () => {
  const response = await axios()

  return response
}

const signin = async data => {
  const response = await axios.post('/signin', data)

  return response
}

export const signup = async (data, path = '/signup') => {
  const response = await axios.post(path, data)

  return response
}

const signout = async () => {
  const response = await axios('/signout')

  return response
}

export const forgotPassword = async data => {
  const response = await axios.post('/forgot-password', data)

  return response
}

export const resetPassword = async (data, resetToken) => {
  const response = await axios.put(`/reset-password/${resetToken}`, data)

  return response
}

export default { authUser, signin, signup, signout }
