import React from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { Menu, InputNumber } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import { addItem, removeItem } from '@redux/cart/cartSlice'

import './styles.scss'

const { Item } = Menu

const CartItem = ({ item, ...otherProps }) => {
  const dispatch = useDispatch()

  return (
    <>
      <Item
        {...otherProps}
        title={`${item.name}-${item.model}`}
        className={`cart-item-wrapper${
          item.discount ? ' show-item-discount' : ''
        }`}>
        <div className='cart-item'>
          <img
            className='cart-item-img'
            src={item.previewImg}
            alt={`${item.name}-${item.model}-img`}
          />
          <div className='cart-item-info'>
            {item.discount && (
              <span className='cart-item-discount'>{`-${item.discount}%`}</span>
            )}
            <h4 className='cart-item-name'>
              {item.name}-{item.model}
            </h4>
            <h3 className='cart-item-price'>
              {item.discount && <span>${item.price}</span>}$
              {item.discount
                ? item.price - (item.discount / 100) * item.price
                : item.price}
            </h3>
            <div className='cart-item-actions'>
              <InputNumber
                title=''
                keyboard
                type='number'
                min={0}
                max={item.inStock}
                value={item.quantity}
                defaultValue={item.quantity}
                style={{ width: '8ch' }}
                onClick={e => {
                  e.stopPropagation()
                }}
                onChange={value =>
                  item.quantity < value
                    ? dispatch(addItem(item))
                    : dispatch(removeItem({ id: item.id }))
                }
              />
              <DeleteOutlined
                title=''
                style={{ fontSize: '1.5rem' }}
                onClick={e => {
                  e.stopPropagation()
                  dispatch(removeItem({ id: item.id, removeAll: true }))
                }}
              />
            </div>
          </div>
        </div>
      </Item>
      <li
        style={{
          minHeight: '1px',
          margin: '4px 0',
          backgroundColor: '#f0f0f0',
        }}
      />
    </>
  )
}

CartItem.propTypes = {
  item: PropTypes.instanceOf(Object).isRequired,
}

export default CartItem
