import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useErrorBoundary } from 'react-error-boundary'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Layout, Skeleton, Pagination, Empty } from 'antd'

import ProductItem from '@components/ProductItem/index'
import FilterSiderMenu from '@components/FilterSiderMenu/index'

import { selectProductsByType } from '@redux/product/productSlice'

import { handleAsyncThunkError } from '@utils/asyncThunkErrorHandler'

const { Sider, Content } = Layout

const ProductsPreview = ({
  title,
  action,
  params,
  type,
  skeletons,
  withSider,
}) => {
  const dispatch = useDispatch()
  const products = useSelector(selectProductsByType(type))
  const { showBoundary } = useErrorBoundary()
  const history = useHistory()
  const { pathname } = useLocation()
  const productsRef = useRef(null)
  const [errorResponse, setErrorResponse] = useState('')

  useEffect(() => {
    let response

    const getProducts = async () => {
      try {
        response = dispatch(action(params))
        await response?.unwrap?.()
        setErrorResponse('')
      } catch (err) {
        handleAsyncThunkError(err, showBoundary, {
          showBoundaryOnlyOnServerError: true,
        })

        if (err.name !== 'AbortError') {
          const { data: { message } = { message: undefined } } = err
          setErrorResponse(message)
        }
      }
    }

    getProducts()

    return () => {
      response?.abort?.('Request Aborted due to component unmount.')
    }
  }, [dispatch, action, params, showBoundary])

  return (
    <Layout style={{ backgroundColor: '#fff' }}>
      <Content>
        <div ref={productsRef} className='products-preview-wrapper'>
          <div className='title'>{title}</div>
          <Layout
            style={{ backgroundColor: '#fff', width: '100%', height: '100%' }}>
            <Content className='products-preview-content'>
              {withSider && (
                <Sider
                  trigger={null}
                  width={280}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flex: '1 1 280px',
                    backgroundColor: '#f0f2f5',
                  }}>
                  <FilterSiderMenu params={params} />
                </Sider>
              )}
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
                        <Skeleton.Image
                          style={{ width: '200px', height: '200px' }}
                        />
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
                    style={{ margin: 'auto' }}
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
                  showTotal={(total, range) =>
                    `${range[0]} - ${range[1]} of ${total}`
                  }
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
            </Content>
          </Layout>
        </div>
      </Content>
    </Layout>
  )
}

ProductsPreview.defaultProps = {
  params: {},
  skeletons: 8,
  withSider: false,
}

ProductsPreview.propTypes = {
  title: PropTypes.node.isRequired,
  action: PropTypes.func.isRequired,
  params: PropTypes.instanceOf(Object),
  type: PropTypes.string.isRequired,
  skeletons: PropTypes.number,
  withSider: PropTypes.bool,
}

export default ProductsPreview
