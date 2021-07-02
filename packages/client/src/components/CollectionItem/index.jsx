import React from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'antd'

import './styles.scss'

const { Item } = Menu

const CollectionItem = ({ name, imgUrl, ...otherProps }) => {
  return (
    <Item className='collection-item' {...otherProps}>
      <div>
        <img
          className='collection-img'
          src={imgUrl}
          alt={`${name}-watch`}
          width='200'
          height='200'
          loading='lazy'
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
