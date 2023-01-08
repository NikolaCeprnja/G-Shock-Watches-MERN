import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Skeleton, Button, Rate, Badge, List, Avatar, Comment } from 'antd'
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons'

import {
  clearProductPreview,
  selectProductsByType,
} from '@redux/product/productSlice'
import { getProductById } from '@redux/product/productThunk'

import { addItem } from '@redux/cart/cartSlice'

const ProductPreview = ({ pid }) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const productForPreview = useSelector(selectProductsByType('preview'))
  const [imgSrc, setImgSrc] = useState('')
  const [imgIsLoading, setImgIsLoading] = useState(true)
  const reviewsRef = useRef(null)

  useEffect(() => {
    const fetchProductById = async () => {
      const response = await dispatch(getProductById(pid))

      if (response.error) {
        history.push('/404')
      }
    }

    fetchProductById()

    return () => {
      setImgSrc('')
      dispatch(clearProductPreview())
    }
  }, [history, dispatch, pid])

  return (
    <div className='product-preview'>
      <div className='product-preview-wrapper'>
        <div className='product-images-wrapper'>
          <div className='product-img-active'>
            {(imgIsLoading || productForPreview.loading) && (
              <Skeleton.Image style={{ width: '368px', height: '550px' }} />
            )}
            <img
              className={
                imgIsLoading || productForPreview.loading ? 'loading' : ''
              }
              onLoad={() => setImgIsLoading(false)}
              src={imgSrc || productForPreview.data?.images[0]}
              alt={`${productForPreview.data?.name}-${productForPreview.data?.model}-img`}
            />
          </div>
          <div className='product-images'>
            {!productForPreview.loading && productForPreview.data?.images
              ? productForPreview.data.images.map(img => (
                  <button
                    key={img}
                    type='button'
                    style={{ cursor: 'pointer' }}
                    onClick={e =>
                      setImgSrc(e.currentTarget.firstChild.getAttribute('src'))
                    }>
                    <img
                      src={img}
                      alt='product-img-item'
                      width={66}
                      height={66}
                      style={{
                        margin: '0 0.5rem',
                      }}
                    />
                  </button>
                ))
              : [...Array(8)].map((e, i) => (
                  <Skeleton.Image
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    style={{
                      width: '66px',
                      height: '66px',
                      margin: '0 0.5rem 1rem 0.5rem',
                    }}
                  />
                ))}
          </div>
        </div>
        <div className='product-preview-info'>
          <span className='product-reviews-count'>
            <Rate
              disabled
              allowHalf
              defaultValue={0}
              value={productForPreview.data?.avgRating || 0}
              style={{ marginRight: '0.5rem' }}
            />
            <Button
              type='link'
              style={{ padding: 0 }}
              onClick={() =>
                reviewsRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                  inline: 'start',
                })
              }>
              ({productForPreview.data?.numReviews || 0})
            </Button>
          </span>
          {productForPreview.data && !productForPreview.loading ? (
            <>
              {productForPreview.data.discount ? (
                <Badge.Ribbon
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    top: '-1.5rem',
                    right: '-0.5rem',
                  }}
                  color='red'
                  text={`${productForPreview.data?.discount}% off`}>
                  <h1 className='product-preview-name'>{`${productForPreview.data.name}-${productForPreview.data.model}`}</h1>
                </Badge.Ribbon>
              ) : (
                <h1 className='product-preview-name'>{`${productForPreview.data.name}-${productForPreview.data.model}`}</h1>
              )}
              <hr />
              <h3 className='product-preview-price'>
                {productForPreview.data.discount && (
                  <span>${productForPreview.data.price.toFixed(2)}</span>
                )}
                $
                {productForPreview.data.discount
                  ? (
                      productForPreview.data.price -
                      (productForPreview.data.discount / 100) *
                        productForPreview.data.price
                    ).toFixed(2)
                  : productForPreview.data.price.toFixed(2)}
              </h3>
              <p className='product-preview-desc'>
                {`${productForPreview.data.desc}`}
              </p>
            </>
          ) : (
            <>
              <Skeleton active title paragraph={{ rows: 0 }} />
              <Skeleton active paragraph={{ rows: 15 }} />
            </>
          )}
          {productForPreview.data?.otherColors && !productForPreview.loading && (
            <div className='product-preview-other-colors'>
              <h2 style={{ fontSize: '1.5rem' }}>Other Colors</h2>
              {productForPreview.data.otherColors.map(product => (
                <Link
                  key={product.id}
                  to={`/watches/${
                    productForPreview.data.gender
                  }/${productForPreview.data.collectionName.toLowerCase()}/${
                    product.id
                  }`}>
                  <img
                    title={`${product.name}-${product.model}`}
                    style={{ width: '66px' }}
                    src={product.previewImg}
                    alt='product-item'
                  />
                </Link>
              ))}
            </div>
          )}
          {productForPreview.loading && (
            <div>
              <Skeleton active paragraph={{ rows: 0 }} />
              {[...Array(4)].map((e, i) => (
                <Skeleton.Image
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  style={{
                    width: '66px',
                    height: '66px',
                    margin: '0 0.5rem 1rem 0.5rem',
                  }}
                />
              ))}
            </div>
          )}
          {!productForPreview.loading ? (
            <Button
              size='large'
              type='primary'
              icon={<ShoppingCartOutlined />}
              disabled={productForPreview.data?.inStock === 0}
              onClick={() => dispatch(addItem(productForPreview.data))}
              style={{
                width: '16rem',
                margin: '2rem auto',
                padding: '2rem 0',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              Add To Cart
            </Button>
          ) : (
            <Skeleton.Button
              active
              size='large'
              className='skeleton-btn'
              style={{
                margin: '1rem 0',
                width: '16rem',
              }}
            />
          )}
        </div>
      </div>
      <div className='product-preview-details'>
        <div className='product-preview-features'>
          <h2>Features</h2>
          {productForPreview.loading ? (
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 3 }}
              style={{ width: '50%' }}
            />
          ) : (
            <ul style={{ lineHeight: '2rem' }}>
              {productForPreview.data?.mainFeatures.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
        </div>
        <div className='product-preview-specifications'>
          <h2>Specifiations</h2>
          {productForPreview.loading ? (
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 8 }}
              style={{ width: '50%' }}
            />
          ) : (
            <ul style={{ lineHeight: '2rem' }}>
              {productForPreview.data?.specifications.map(specification => (
                <li key={specification}>{specification}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {productForPreview.data?.reviews.length > 0 && (
        <div
          ref={reviewsRef}
          style={{
            width: '80%',
            display: 'flex',
            alignSelf: 'center',
            flexDirection: 'column',
          }}>
          <List
            header={
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0' }}>
                Reviews
              </h1>
            }
            dataSource={productForPreview.data?.reviews}
            renderItem={review => (
              <List.Item>
                <Comment
                  key={review.id}
                  avatar={
                    <Avatar
                      className='avatar-comment-img'
                      src={review.creator.avatarUrl}
                      icon={<UserOutlined />}
                    />
                  }
                  author={<h2>{review.creator.userName}</h2>}
                  content={
                    <>
                      <Rate disabled allowHalf value={review.score} />
                      <br />
                      {review.desc}
                    </>
                  }
                  datetime={review.createdAt}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  )
}

ProductPreview.propTypes = { pid: PropTypes.string.isRequired }

export default ProductPreview
