import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { Skeleton } from 'antd'

import ProductItem from '@components/ProductItem/index'

import { selectProductByType } from '@redux/product/productSlice'

const ProductsPreview = ({ title, action, type, skeletons }) => {
  const dispatch = useDispatch()
  const products = useSelector(selectProductByType(type))

  useEffect(() => {
    const getProducts = () => dispatch(action())

    getProducts()
  }, [dispatch, action])

  return (
    <div className='products-preview-container'>
      <div className='title'>
        <h2>{title}</h2>
        <hr />
      </div>
      {products.loading
        ? [...Array(skeletons)].map((e, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 30px',
                width: '25%',
              }}>
              <Skeleton.Image style={{ width: '140px', height: '140px' }} />
              <Skeleton
                active
                className='product-item-skeleton'
                paragraph={{ rows: 3 }}
              />
              <Skeleton.Button active size='large' style={{ width: '140px' }} />
              <Skeleton
                active
                className='product-item-skeleton'
                paragraph={{ rows: 0 }}
              />
            </div>
          ))
        : products.data?.map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
    </div>
  )
}

ProductsPreview.defaultProps = {
  skeletons: 4,
}

ProductsPreview.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  skeletons: PropTypes.number,
}

export default ProductsPreview
