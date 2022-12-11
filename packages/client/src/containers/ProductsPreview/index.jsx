import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Skeleton, Pagination, Empty } from 'antd'

import ProductItem from '@components/ProductItem/index'

import { selectProductsByType } from '@redux/product/productSlice'

const ProductsPreview = ({ title, action, params, type, skeletons }) => {
  const dispatch = useDispatch()
  const products = useSelector(selectProductsByType(type))
  const history = useHistory()
  const { pathname } = useLocation()
  const productsRef = useRef(null)
  const [errorResponse, setErrorResponse] = useState('')

  useEffect(() => {
    const getProducts = async () => {
      try {
        await dispatch(action(params)).unwrap()
        setErrorResponse('')
      } catch (err) {
        const {
          data: { message },
        } = err
        setErrorResponse(message)
      }
    }

    getProducts()
  }, [dispatch, action, params])

  return (
    <div ref={productsRef} className='products-preview-wrapper'>
      <div className='title'>
        <h2>{title}</h2>
        <hr />
      </div>
      <div className='products-preview-container'>
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
                  padding: '2rem',
                  width: '25%',
                }}>
                <Skeleton.Image style={{ width: '200px', height: '200px' }} />
                <Skeleton
                  active
                  className='product-item-skeleton-info'
                  paragraph={{ rows: 3 }}
                />
                <Skeleton.Button
                  active
                  size='large'
                  style={{ width: '140px' }}
                />
                <Skeleton
                  active
                  className='product-item-skeleton-info'
                  paragraph={{ rows: 0 }}
                />
              </div>
            ))
          : products.data?.map(product => (
              <ProductItem key={product.id} product={product} />
            ))}
        {errorResponse && (
          <Empty
            image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
            imageStyle={{
              height: 180,
            }}
            style={{ margin: '0 auto' }}
            description={
              <h3 style={{ color: 'gray', fontSize: '1.5rem' }}>
                {errorResponse}
              </h3>
            }
          />
        )}
      </div>
      {products.data && !products.loading && (
        <Pagination
          hideOnSinglePage
          pageSize={8}
          showTotal={(total, range) => `${range[0]} - ${range[1]} of ${total}`}
          current={products.curPage}
          total={products.totalData}
          onChange={pageNum => {
            if (pageNum === 1) {
              history.push({ pathname })
            } else {
              history.push({
                pathname,
                search: `?page=${pageNum}`,
              })
            }

            productsRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest',
            })
          }}
          style={{ margin: '1rem 0 2rem 0' }}
        />
      )}
    </div>
  )
}

ProductsPreview.defaultProps = {
  params: {},
  skeletons: 8,
}

ProductsPreview.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  params: PropTypes.instanceOf(Object),
  type: PropTypes.string.isRequired,
  skeletons: PropTypes.number,
}

export default ProductsPreview
