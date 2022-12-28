import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Dropdown, Menu, Badge, Button } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'

import CartItem from '@components/CartItem/index'

import {
  selectCartItems,
  selectCartItemsCount,
  selectCartItemsSubtotal,
} from '@redux/cart/cartSlice'

const { ItemGroup, Item } = Menu

const CartDropdownMenu = () => {
  const history = useHistory()
  const cartItems = useSelector(selectCartItems)
  const cartItemsCount = useSelector(selectCartItemsCount)
  const cartItemsSutotal = useSelector(selectCartItemsSubtotal)
  const [isVisible, setIsVisible] = useState(false)

  const handleVisibleChange = visible => {
    setIsVisible(visible)
  }

  return (
    <Dropdown
      visible={isVisible}
      onVisibleChange={handleVisibleChange}
      overlayClassName='cart-dropdown-menu'
      overlayStyle={{
        position: 'fixed',
      }}
      overlay={
        <Menu
          style={{
            padding: 0,
          }}
          onClick={e => {
            if (
              e.domEvent.target.closest('.ant-input-number-handler-wrap') ===
              null
            ) {
              setIsVisible(false)
              history.push(e.key)
            }
          }}>
          <ItemGroup className='cart-items-group'>
            {!cartItems?.length ? (
              <li className='cart-empty-msg'>Cart is empty</li>
            ) : (
              cartItems.map(item => (
                <CartItem
                  key={`/watches/${
                    item.gender
                  }/${item.collectionName.toLowerCase()}/${item.id}`}
                  item={item}
                />
              ))
            )}
          </ItemGroup>
          <Item disabled style={{ cursor: 'auto' }} className='cart-actions'>
            <p className='cart-subtotal'>
              <span>Subtotal:</span>
              <span>${cartItemsSutotal.toFixed(2)}</span>
            </p>
            <Button
              block
              size='large'
              type='primary'
              htmlType='button'
              disabled={!cartItems?.length > 0 ?? true}
              onClick={() => {
                setIsVisible(false)
                history.push('/checkout')
              }}>
              Checkout
            </Button>
          </Item>
        </Menu>
      }>
      <div>
        <Badge showZero size='small' count={cartItemsCount}>
          <ShoppingCartOutlined
            style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '1.2rem' }}
          />
        </Badge>
      </div>
    </Dropdown>
  )
}

export default CartDropdownMenu
