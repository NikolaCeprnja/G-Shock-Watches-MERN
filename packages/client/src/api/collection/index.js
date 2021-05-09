import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const getCollectionsByGender = async gender => {
  const response = await axios(`/collections/${gender}`)

  return response
}

export default { getCollectionsByGender }
