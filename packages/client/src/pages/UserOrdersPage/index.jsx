import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Table, Empty } from 'antd'

import { getUserOrders } from '@redux/user/userThunk'
import { ORDERS_COLUMNS } from '@shared/constants'

const UserOrdersPage = ({ uid, updateFor }) => {
  const dispatch = useDispatch()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const source = axios.CancelToken.source()

    const getOrdersByUserId = async () => {
      try {
        setIsLoading(true)
        const { orders: userOrders } = await dispatch(
          getUserOrders({ uid, cancelToken: source, updateFor })
        ).unwrap()
        setOrders(userOrders)
        setIsLoading(false)
      } catch (err) {
        const {
          data: { message },
        } = err

        if (err.status !== 'ABORTED') {
          setIsLoading(false)
          setErrMsg(message)
        }
      }
    }

    getOrdersByUserId()

    return () => {
      source.cancel('Request Aborted due to component unmount.')
    }
  }, [dispatch, uid, updateFor])

  return (
    <div className='UserOurdersPage'>
      <Table
        rowKey='id'
        rowSelection
        pagination={false}
        loading={isLoading}
        dataSource={orders}
        columns={ORDERS_COLUMNS(undefined, undefined, true)}
        locale={{
          emptyText: isLoading ? (
            <p style={{ fontSize: '1.2rem' }}>Loading user orders data...</p>
          ) : (
            <Empty
              image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
              imageStyle={{ height: 150 }}
              description={
                <h3 style={{ color: 'gray', fontSize: '1.2rem' }}>
                  {errMsg || "This user doesn't have any orders yet."}
                </h3>
              }
            />
          ),
        }}
      />
    </div>
  )
}

UserOrdersPage.defaultProps = {
  updateFor: 'loggedInUser',
}

UserOrdersPage.propTypes = {
  uid: PropTypes.string.isRequired,
  updateFor: PropTypes.string,
}

export default UserOrdersPage
