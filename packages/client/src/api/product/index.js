import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/products',
  headers: { 'Content-Type': 'application/json' },
})

const getLatestProducts = async () => {
  const response = await axios('/latest')

  return response
}

const getTopRatedProducts = async () => {
  const response = await axios('/top-rated')

  return response
}

export default { getLatestProducts, getTopRatedProducts }
