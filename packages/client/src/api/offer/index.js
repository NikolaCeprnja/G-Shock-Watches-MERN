import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/offers',
  headers: { 'Content-Type': 'application/json' },
})

const getOffers = async cancelToken => {
  const response = await axios({ cancelToken })
  return response
}

export default { getOffers }
