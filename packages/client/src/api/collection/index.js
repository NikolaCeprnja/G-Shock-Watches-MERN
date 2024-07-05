import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/collections',
  headers: { 'Content-Type': 'application/json' },
})

const getCollections = async cancelToken => {
  const response = await axios({ cancelToken })
  return response
}

const getCollectionsByGender = async (gender, cancelToken) => {
  const response = await axios(`/${gender}`, { cancelToken })
  return response
}

export default { getCollections, getCollectionsByGender }
