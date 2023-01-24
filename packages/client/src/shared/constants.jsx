import React from 'react'
import { Tag, Rate, InputNumber } from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  SmileOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

const COLLECTION_COLOR = Object.freeze({
  men: 'geekblue',
  women: 'purple',
  all: 'gold',
})

const CHECKOUT_STEPS = [
  {
    key: 'auth',
    title: 'Authenticate',
    icon: <UserOutlined />,
    path: '/checkout/auth',
  },
  {
    key: 'checkout',
    title: 'Checkout',
    icon: <ShoppingCartOutlined />,
    path: '/checkout/summary',
  },
  {
    key: 'shipping',
    title: 'Shipping',
    icon: <CarOutlined />,
    path: '/checkout/shipping',
  },
  {
    key: 'finish',
    title: 'Finish',
    icon: <SmileOutlined />,
    path: '/checkout/finish',
    disabled: true,
  },
]

const PRODUCT_COLUMNS = (
  defaultFilteredValue = undefined,
  defaultSortOrder = undefined
) => [
  {
    title: 'Name-Model',
    dataIndex: 'name',
    width: '25%',
    render: (name, { model, previewImg }) => (
      <div>
        <img
          src={previewImg}
          alt={`${name}-img`}
          width='60'
          height='auto'
          style={{ marginRight: '1rem' }}
        />
        <span>{`${name}-${model}`}</span>
      </div>
    ),
  },
  {
    title: 'Collection',
    align: 'center',
    dataIndex: 'collectionName',
    defaultFilteredValue: defaultFilteredValue?.collectionName,
    filters: [
      { text: 'MT-G', value: 'MT-G' },
      { text: 'G-STEEL', value: 'G-STEEL' },
      { text: 'DIGITAL', value: 'DIGITAL' },
      { text: 'ANALOG-DIGITAL', value: 'ANALOG-DIGITAL' },
      { text: 'MR-G', value: 'MR-G' },
      { text: 'MASTER OF G', value: 'MASTER OF G' },
      { text: 'G-SHOCK MOVE', value: 'G-SHOCK MOVE' },
      { text: 'G-MS', value: 'G-MS' },
      { text: 'G-SHOCK WOMEN', value: 'G-SHOCK WOMEN' },
      { text: 'BABY-G', value: 'BABY-G' },
      { text: 'LIMITED EDITION', value: 'LIMITED EDITION' },
    ],
    render: (collectionName, { gender }) => (
      <Tag color={COLLECTION_COLOR[gender]}>{collectionName}</Tag>
    ),
  },
  {
    key: 'data.price',
    title: 'Price',
    align: 'center',
    sorter: true,
    defaultSortOrder: defaultSortOrder?.price,
    dataIndex: 'price',
    render: (price, { discount }) => {
      if (discount) {
        const currentPrice = price - (price / 100) * discount

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <span
              style={{
                color: 'rgb(179, 179, 179)',
                textDecoration: 'line-through solid 1px #f5222d',
              }}>
              ${price.toFixed(2)}
            </span>
            <span style={{ fontSize: '1rem' }}>${currentPrice.toFixed(2)}</span>
          </div>
        )
      }

      return <span>${price.toFixed(2)}</span>
    },
  },
  {
    key: 'data.discount',
    title: 'Discount',
    align: 'center',
    sorter: true,
    defaultSortOrder: defaultSortOrder?.discount,
    dataIndex: 'discount',
    render: discount =>
      discount ? <Tag color='red'>{discount}%</Tag> : <span>/</span>,
  },
  {
    key: 'data.inStock',
    title: 'In Stock',
    align: 'center',
    sorter: true,
    defaultSortOrder: defaultSortOrder?.inStock,
    dataIndex: 'inStock',
  },
  {
    key: 'data.numReviews',
    title: 'Reviews',
    align: 'center',
    sorter: true,
    defaultSortOrder: defaultSortOrder?.numReviews,
    dataIndex: 'numReviews',
    render: (numReviews, { avgRating }) => (
      <div>
        <Rate
          disabled
          allowHalf
          value={avgRating}
          style={{ marginRight: '0.5rem' }}
        />
        <span>({numReviews || 0})</span>
      </div>
    ),
  },
]

const PRODUCT_CHECKOUT_COLUMNS = (
  handleCartItemQuantityChange,
  handleCartItemRemove
) => [
  {
    title: 'Name-Model',
    dataIndex: 'name',
    fixed: 'left',
    width: '20%',
    render: (name, { model, previewImg }) => (
      <div>
        <img
          src={previewImg}
          alt={`${name}-img`}
          width='60'
          height='auto'
          style={{ marginRight: '1rem' }}
        />
        <span>{`${name}-${model}`}</span>
      </div>
    ),
  },
  {
    title: 'Collection',
    width: '15%',
    align: 'center',
    dataIndex: 'collectionName',
    render: (collectionName, { gender }) => (
      <Tag color={COLLECTION_COLOR[gender]}>{collectionName}</Tag>
    ),
  },
  {
    title: 'Price',
    width: '10%',
    align: 'center',
    dataIndex: 'price',
    render: (price, { discount }) => {
      if (discount) {
        const currentPrice = price - (price / 100) * discount

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
            <span
              style={{
                color: 'rgb(179, 179, 179)',
                textDecoration: 'line-through solid 1px #f5222d',
              }}>
              ${price.toFixed(2)}
            </span>
            <span style={{ fontSize: '1rem' }}>${currentPrice.toFixed(2)}</span>
          </div>
        )
      }

      return <span>${price.toFixed(2)}</span>
    },
  },
  {
    title: 'Discount',
    dataIndex: 'discount',
    render: discount =>
      discount ? <Tag color='red'>{discount}%</Tag> : <span>/</span>,
  },
  {
    title: 'Quantity',
    width: '10%',
    fixed: 'right',
    align: 'center',
    dataIndex: 'quantity',
    render: (quantity, record) => {
      return (
        <InputNumber
          title=''
          keyboard
          type='number'
          min={0}
          max={record.inStock}
          value={quantity}
          defaultValue={quantity}
          style={{ width: '8ch' }}
          onClick={e => {
            e.stopPropagation()
          }}
          onChange={value =>
            handleCartItemQuantityChange(quantity, value, record)
          }
        />
      )
    },
  },
  {
    title: 'Action',
    width: '5%',
    fixed: 'right',
    align: 'center',
    dataIndex: '',
    key: 'RemoveItem',
    render: (_, record) => (
      <DeleteOutlined
        title=''
        style={{ fontSize: '1.5rem' }}
        onClick={e => {
          e.stopPropagation()
          handleCartItemRemove(record.id)
        }}
      />
    ),
  },
]

export {
  COLLECTION_COLOR,
  CHECKOUT_STEPS,
  PRODUCT_COLUMNS,
  PRODUCT_CHECKOUT_COLUMNS,
}
