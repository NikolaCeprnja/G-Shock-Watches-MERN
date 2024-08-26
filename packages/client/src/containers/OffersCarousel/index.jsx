import React, { useEffect } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useDispatch, useSelector } from 'react-redux'
import { Carousel } from 'antd'

import OfferItem from '@components/OfferItem/index'

import { selectOffers } from '@redux/offer/offerSlice'
import { getOffers } from '@redux/offer/offerThunk'

import { handleAsyncThunkError } from '@utils/asyncThunkErrorHandler'

const OffersCarousel = () => {
  const dispatch = useDispatch()
  const offers = useSelector(selectOffers)
  const { showBoundary } = useErrorBoundary()

  useEffect(() => {
    let response

    const getCurrentOffers = async () => {
      try {
        response = dispatch(getOffers())
        await response?.unwrap?.()
      } catch (err) {
        handleAsyncThunkError(err, showBoundary, {
          showBoundaryOnlyOnServerError: true,
        })
      }
    }

    getCurrentOffers()

    return () => {
      response?.abort?.('Request Aborted due to component unmount.')
    }
  }, [dispatch, showBoundary])

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
