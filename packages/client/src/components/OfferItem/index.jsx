import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

const OfferItem = ({ offer: { imgUrls, videoUrl, title, description } }) => {
  return (
    <>
      {imgUrls.length ? (
        <img
          className='offer-img'
          data-src={`${imgUrls[3]}`}
          sizes='100vw'
          /* srcSet='
					/images/offers/MRGB2000R_480x480.jpg 480w,
					/images/offers/MRGB2000R_991x991.jpg 991w,
					/images/offers/MRGB2000R_1200x1200.jpg 1200w,
					/images/offers/MRGB2000R_1900x1900.jpg 1900w' */
          alt='offer-img'
          src={`${imgUrls[3]}`}
        />
      ) : null}
      {videoUrl && (
        <video
          className='offer-video'
          src={videoUrl}
          type='video/mp4'
          autoPlay
          muted
          playsInline
          loop
          preload='auto'>
          Your browser does not support this video format.
        </video>
      )}
      <div className='offer-info'>
        <h2 className='offer-title'>{title}</h2>
        <hr />
        <p className='offer-description'>{description}</p>
        <Button className='offer-btn'>Shop Now</Button>
      </div>
    </>
  )
}

OfferItem.propTypes = {
  offer: PropTypes.instanceOf(Object).isRequired,
}

export default OfferItem
