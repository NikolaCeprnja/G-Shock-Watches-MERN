import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Carousel } from 'antd'

import OfferItem from '@components/OfferItem/index'

import { selectOffers } from '@redux/offer/offerSlice'
import { getOffers } from '@redux/offer/offerThunk'

const OffersCarousel = () => {
  const dispatch = useDispatch()
  const offers = useSelector(selectOffers)

  useEffect(() => {
    const getCurrentOffers = () => dispatch(getOffers())

    getCurrentOffers()
  }, [dispatch])

  return (
    <Carousel
      autoplay
      draggable
      accessibility
      pauseOnDotsHover
      autoplaySpeed={5000}
      className='offers-carousel'>
      {offers.data?.length
        ? offers.data.map(offer => (
            // eslint-disable-next-line no-underscore-dangle
            <OfferItem key={offer._id} offer={offer} />
          ))
        : null}
    </Carousel>
  )
}

export default OffersCarousel
