import React from 'react'
import { Tag, Rate, Select, InputNumber } from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  SmileOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

const { Option } = Select

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

const PRODUCT_COLOR_OPTIONS = (
  <>
    <Option
      value='white'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem 0.5rem 0.5rem 1rem',
        color: 'white',
        backgroundColor: 'white',
      }}>
      White
    </Option>
    <Option
      value='gray'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem',
        color: 'gray',
        backgroundColor: 'gray',
      }}>
      Gray
    </Option>
    <Option
      value='black'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem',
        color: 'black',
        backgroundColor: 'black',
      }}>
      Black
    </Option>
    <Option
      value='green'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem',
        color: 'green',
        backgroundColor: 'green',
      }}>
      Green
    </Option>
    <Option
      value='blue'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem',
        color: 'blue',
        backgroundColor: 'blue',
      }}>
      Blue
    </Option>
    <Option
      value='gold'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem',
        color: 'gold',
        backgroundColor: 'gold',
      }}>
      Gold
    </Option>
    <Option
      value='red'
      style={{
        width: '50px',
        height: '50px',
        margin: '0.5rem',
        color: 'red',
        backgroundColor: 'red',
      }}>
      Red
    </Option>
  </>
)

const PRODUCT_TYPES_OPTIONS = (
  <>
    <Option value='Sports'>Sports</Option>
    <Option value='Extreme Conditions'>Extreme Conditions</Option>
    <Option value='Interchangeable Bands'>Interchangeable Bands</Option>
    <Option value='Mud Resistant'>Mud Resistant</Option>
    <Option value='Water Resistant'>Water Resistant</Option>
  </>
)

const PRODUCT_MATERIALS_OPTIONS = (
  <>
    <Option value='Mineral Glass'>Mineral Glass</Option>
    <Option value='Sapphire Crystal'>Sapphire Crystal</Option>
    <Option value='Ion Plated (IP)'>Ion Plated (IP)</Option>
    <Option value='Titanium'>Titanium</Option>
    <Option value='Carbon'>Carbon</Option>
    <Option value='Stainless Steel'>Stainless Steel</Option>
    <Option value='Cloth'>Cloth</Option>
    <Option value='Resin'>Resin</Option>
  </>
)

const PRODUCT_MAIN_FEATURES_OPTIONS = (
  <>
    <Option value='Altimeter'>Altimeter</Option>
    <Option value='Barometer'>Barometer</Option>
    <Option value='Bluetooth-Connected'>Bluetooth-Connected</Option>
    <Option value='GPS'>GPS</Option>
    <Option value='Solar-Powered'>Solar-Powered</Option>
    <Option value='Step-Tracker'>Step-Tracker</Option>
    <Option value='Thermometer'>Thermometer</Option>
    <Option value='Tide Graph'>Tide Graph</Option>
    <Option value='Multiband / Atomic Timekeeping'>
      Multiband / Atomic Timekeeping
    </Option>
  </>
)

export {
  COLLECTION_COLOR,
  CHECKOUT_STEPS,
  PRODUCT_COLUMNS,
  PRODUCT_CHECKOUT_COLUMNS,
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_TYPES_OPTIONS,
  PRODUCT_MATERIALS_OPTIONS,
  PRODUCT_MAIN_FEATURES_OPTIONS,
}
