import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Result, Button } from 'antd'

import { selectLoggedInUser } from '@redux/user/userSlice'

import './styles.scss'

const CheckoutFinishPage = ({ history, location, stepDispatch }) => {
  const {
    info: { id: loggedInUserId },
  } = useSelector(selectLoggedInUser)
  const {
    state: { createdOrder },
  } = location
  const { id: orderId, status } = createdOrder

  useEffect(() => {
    if (sessionStorage.getItem('shippingDetails')) {
      sessionStorage.removeItem('shippingDetails')
    }

    return () => {
      stepDispatch({
        type: 'AVAILABLE',
        payload: { key: 'finish', disabled: true },
      })

      stepDispatch({
        type: 'STATUS',
        payload: { key: 'checkout', status: 'error' },
      })

      stepDispatch({
        type: 'STATUS',
        payload: { key: 'shipping', status: 'wait' },
      })
    }
  }, [stepDispatch])

  return (
    <div className='result-wrapper'>
      <Result
        status='success'
        title={<h1 className='result-title'>Order Successfully Created!</h1>}
        subTitle={
          <span className='result-subtitle'>
            <b>Order Id:</b> {orderId} <b>Status:</b> {status.info} <b>At:</b>{' '}
            {status.date} <hr />
            Your order is successfully created, you can preview it or continue
            shopping.
            <br /> Thank you for your trust!
          </span>
        }
        extra={[
          <Button
            key='order-preview'
            type='primary'
            size='large'
            onClick={() =>
              history.push(`/users/${loggedInUserId}/profile/orders/${orderId}`)
            }>
            Preview An Order
          </Button>,
          <Button
            key='order-create'
            size='large'
            onClick={() => history.push('/watches')}>
            Continue Shopping
          </Button>,
        ]}
      />
    </div>
  )
}

CheckoutFinishPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.instanceOf(Object).isRequired,
  stepDispatch: PropTypes.func.isRequired,
}

export default CheckoutFinishPage
