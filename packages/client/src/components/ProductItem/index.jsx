import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Rate, Tag, Button } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'

import { selectCartItemCount, addItem } from '@redux/cart/cartSlice'

import './styles.scss'

const ProductItem = ({ product }) => {
  const dispatch = useDispatch()
  const cartItemCount = useSelector(selectCartItemCount(product.id))

  return (
    <div className='product-item' title={`${product.name}-${product.model}`}>
      {product.discount > 0 && (
        <div className='ribbon'>
          <span className='ribbon-text'>{product.discount}% off</span>
          <div className='ribbon-corner' />
        </div>
      )}
      <Link
        to={`/watches/${product.collectionName.toLowerCase()}/${product.id}`}>
        <div className='img-wrapper'>
          <img
            className='product-img'
            src={product.previewImg}
            alt={`${product.name}-img`}
            width={200}
            height={200}
          />
        </div>
        <div className='product-rate'>
          <Rate disabled allowHalf defaultValue={0} value={product.avgRating} />
          <span className='product-reviews-count'>
            ({product.numReviews || 0})
          </span>
        </div>
        <Tag className='product-collection-name' color='gold'>
          {product.collectionName}
        </Tag>
        <div className='product-info'>
          <h3 className='product-name'>{`${product.name}-${product.model}`}</h3>
          {product.discount ? (
            <span className='product-old-price'>${product.price}</span>
          ) : null}
          <span className='product-price'>
            $
            {product.discount
              ? product.price - (product.discount / 100) * product.price
              : product.price}
          </span>
        </div>
      </Link>
      <Button
        disabled={cartItemCount === product.inStock}
        icon={<ShoppingCartOutlined />}
        onClick={() =>
          dispatch(
            addItem({
              id: product.id,
              name: product.name,
              model: product.model,
              collectionName: product.collectionName,
              previewImg: product.previewImg,
              price: product.price,
              discount: product.discount,
              inStock: product.inStock,
            })
          )
        }>
        Add to Cart
      </Button>
      <Link
        to={`/watches/${product.collectionName.toLowerCase()}/${product.id}`}>
        Learn More
      </Link>
    </div>
  )
}

ProductItem.propTypes = {
  product: PropTypes.instanceOf(Object).isRequired,
}

export default ProductItem
