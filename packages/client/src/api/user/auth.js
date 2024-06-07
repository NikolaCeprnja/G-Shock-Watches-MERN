import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/users/auth',
  headers: { 'Content-Type': 'application/json' },
})

const authUser = async cancelToken => {
  const response = await axios({ cancelToken })
  return response
}

const signin = async (data, cancelToken) => {
  const response = await axios.post('/signin', data, { cancelToken })
  return response
}

export const signup = async (data, cancelToken, path = '/signup') => {
  const response = await axios.post(path, data, { cancelToken })
  return response
}

const signout = async cancelToken => {
  const response = await axios('/signout', { cancelToken })
  return response
}

export const forgotPassword = async (data, cancelToken) => {
  const response = await axios.post('/forgot-password', data, { cancelToken })
  return response
}

export const resetPassword = async (data, resetToken, cancelToken) => {
  const response = await axios.put(`/reset-password/${resetToken}`, data, {
    cancelToken,
  })
  return response
}

export default { authUser, signin, signup, signout }
