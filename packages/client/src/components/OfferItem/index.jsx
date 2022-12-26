import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

const OfferItem = ({ offer: { imgUrls, videoUrl, title, description } }) => {
  return (
    <>
      {imgUrls.length ? (
        <img
          className='offer-img'
          srcSet={`
					${imgUrls[0]} 480w,
					${imgUrls[1]} 991w,
					${imgUrls[2]} 1200w,
					${imgUrls[3]} 1900w`}
          sizes='100vw'
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
