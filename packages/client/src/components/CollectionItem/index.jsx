import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Menu, Skeleton } from 'antd'

import './styles.scss'

const { Item } = Menu

const CollectionItem = ({ name, imgUrl, ...otherProps }) => {
  const [imgIsLoading, setImgIsLoading] = useState(true)

  return (
    <Item className='collection-item' {...otherProps}>
      <div>
        {imgIsLoading && (
          <Skeleton.Image
            style={{ width: 'calc(14vw * 0.88)', height: '14vw' }}
          />
        )}
        <img
          onLoad={() => setImgIsLoading(false)}
          className={`collection-img${imgIsLoading ? ' loading' : ''}`}
          src={imgUrl}
          alt={`${name}-watch`}
          width={200}
          height={200}
        />
        <h4 className='collection-name'>{name}</h4>
      </div>
    </Item>
  )
}

CollectionItem.propTypes = {
  name: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired,
}

export default CollectionItem
