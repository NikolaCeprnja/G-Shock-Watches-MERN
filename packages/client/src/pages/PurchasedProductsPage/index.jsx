import React, { useLayoutEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Table, Empty } from 'antd'
import axios from 'axios'

import ReviewItem from '@components/ReviewItem/index'

import { USER_REVIEWS_COLUMNS } from '@shared/constants'
import { getPurchasedProductsAndReviews } from '@redux/user/userThunk'

const PurchasedProductsPage = ({ uid, updateFor, purchasedProducts }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useLayoutEffect(() => {
    const source = axios.CancelToken.source()

    const getPurchasedProducts = async () => {
      try {
        if (uid && !purchasedProducts) {
          setLoading(true)
          await dispatch(
            getPurchasedProductsAndReviews({
              uid,
              cancelToken: source,
              updateFor,
            })
          ).unwrap()
          setLoading(false)
        }
      } catch (err) {
        const {
          data: { message },
        } = err

        if (err.status !== 'ABORTED') {
          setLoading(false)
          setErrMsg(message)
        }
      }
    }

    getPurchasedProducts()

    return () => {
      source.cancel('Request Aborted due to component unmount.')
    }
  }, [dispatch, uid, updateFor, purchasedProducts])

  return (
    <Table
      rowKey='id'
      rowSelection
      rowClassName='data-overview-row'
      columns={USER_REVIEWS_COLUMNS}
      loading={loading}
      dataSource={purchasedProducts}
      locale={{
        emptyText: loading ? (
          <p style={{ fontSize: '1.2rem' }}>
            Loading purchased products data...
          </p>
        ) : (
          <Empty
            image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
            imageStyle={{ height: 150 }}
            description={
              <h3 style={{ color: 'gray', fontSize: '1.2rem' }}>
                {errMsg || "This user doesn't have any purchased products yet."}
              </h3>
            }
          />
        ),
      }}
      expandable={{
        rowExpandable: record => record.reviews?.length > 0,
        expandRowByClick: true,
        expandedRowRender: record => {
          const productId = record.id
          const [review] = record.reviews

          return (
            <ReviewItem
              review={review}
              productId={productId}
              updateFor={updateFor}
            />
          )
        },
      }}
      pagination={{
        total: purchasedProducts?.length ?? 0,
        showTotal: (total, range) => `${range[0]} - ${range[1]} of ${total}`,
        defaultPageSize: 8,
        showTitle: true,
        showSizeChanger: true,
        hideOnSinglePage: true,
        pageSizeOptions: [8, 16, 24, 32],
      }}
      scroll={{
        scrollToFirstRowOnChange: true,
      }}
    />
  )
}

PurchasedProductsPage.defaultProps = {
  updateFor: 'loggedInUser',
  purchasedProducts: undefined,
}

PurchasedProductsPage.propTypes = {
  uid: PropTypes.string.isRequired,
  updateFor: PropTypes.string,
  purchasedProducts: PropTypes.arrayOf(Object),
}

export default PurchasedProductsPage
