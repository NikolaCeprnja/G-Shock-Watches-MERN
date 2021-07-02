import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/offers',
  headers: { 'Content-Type': 'application/json' },
})

const getOffers = async () => {
  const response = await axios()

  return response
}

export default { getOffers }
