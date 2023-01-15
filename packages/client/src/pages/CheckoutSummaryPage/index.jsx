import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Empty } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'

import {
  selectCartItems,
  selectCartItemsSubtotal,
  addItem,
  removeItem,
} from '@redux/cart/cartSlice'

import { PRODUCT_CHECKOUT_COLUMNS } from '@shared/constants'

const CheckoutSummaryPage = props => {
  const dispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const cartItemsSubtotal = useSelector(selectCartItemsSubtotal)

  const handleCartItemQuantityChange = useCallback(
    (quantity, newValue, cartItem) =>
      quantity < newValue
        ? dispatch(addItem(cartItem))
        : dispatch(removeItem({ id: cartItem.id })),
    [dispatch]
  )

  const handleCartItemRemove = useCallback(
    itemId => dispatch(removeItem({ id: itemId, removeAll: true })),
    [dispatch]
  )

  return (
    <div className='CheckoutSummaryPage'>
      <Table
        locale={{
          emptyText: (
            <Empty
              image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
              imageStyle={{ height: 150 }}
              description={
                <h3 style={{ color: 'gray', fontSize: '1.5rem' }}>
                  The cart is currently empty, go to{' '}
                  <Link to='/watches'>watches page</Link> and chose what you
                  like!
                </h3>
              }
            />
          ),
        }}
        rowKey='id'
        dataSource={cartItems}
        style={{ padding: '1.5rem 3rem' }}
        columns={PRODUCT_CHECKOUT_COLUMNS(
          handleCartItemQuantityChange,
          handleCartItemRemove
        )}
        title={() => (
          <h1 style={{ fontSize: '2rem' }}>
            <ShoppingCartOutlined /> Checkout Summary
          </h1>
        )}
        footer={() => (
          <div>
            <h2>
              Subtotal: <b>${cartItemsSubtotal.toFixed(2)}</b>
            </h2>
          </div>
        )}
        pagination={false}
      />
    </div>
  )
}

export default CheckoutSummaryPage
