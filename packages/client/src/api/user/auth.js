import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const authUser = async () => {
  const response = await axios('/users/auth')

  return response
}

const signin = async data => {
  const response = await axios.post('/users/auth/signin', data)

  return response
}

const signup = async data => {
  const response = await axios.post('/users/auth/signup', data)

  return response
}

const signout = async () => {
  const response = await axios('/users/auth/signout')

  return response
}

export const forgotPassword = async data => {
  const response = await axios.post('/users/auth/forgotpassword', data)

  return response
}

export const resetPassword = async (data, resetToken) => {
  const response = await axios.put(
    `/users/auth/resetpassword/${resetToken}`,
    data
  )

  return response
}

export default { authUser, signin, signup, signout }
