import * as Axios from 'axios'

const axios = Axios.create({
  baseURL: '/api/collections',
  headers: { 'Content-Type': 'application/json' },
})

const getCollections = async () => {
  const response = await axios()

  return response
}

const getCollectionsByGender = async gender => {
  const response = await axios(`/${gender}`)

  return response
}

export default { getCollections, getCollectionsByGender }
