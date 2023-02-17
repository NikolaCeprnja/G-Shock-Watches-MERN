import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Card, Progress, Menu, Dropdown, Skeleton } from 'antd'
import {
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'

import './styles.scss'

const { Item } = Menu

const menu = (selectedKey, handleMenuClick) => (
  <Menu selectable selectedKeys={[selectedKey]} onClick={handleMenuClick}>
    <Item key='today'>Today</Item>
    <Item key='last-week'>Last week</Item>
    <Item key='last-month'>Last Month</Item>
  </Menu>
)

const SalesCardItem = ({ loading, percent, title, amount, setQueryParams }) => {
  const [selectedKey, setSelectedKey] = useState('today')

  const handleMenuClick = useCallback(
    e => {
      setSelectedKey(e.key)
      setQueryParams({ period: e.key })
    },
    [setQueryParams]
  )

  return (
    <div className='sales-card-item'>
      <div className='sales-menu'>
        <p>Total Revenue</p>
        <Dropdown overlay={menu(selectedKey, handleMenuClick)}>
          <MoreOutlined
            style={{
              cursor: 'pointer',
              padding: '0.4rem',
              backgroundColor: 'lightgray',
              borderRadius: '30%',
            }}
          />
        </Dropdown>
      </div>
      <Card className='sales-statistics' bordered={false}>
        {loading ? (
          <Skeleton
            active
            avatar
            paragraph={{ rows: 0 }}
            className='sales-progress-skeleton'
          />
        ) : (
          <Progress type='circle' percent={Math.floor(percent)} />
        )}
        <p className='sales-title'>{`${title} ${selectedKey
          .split('-')
          .join(' ')}`}</p>
        {loading ? (
          <Skeleton
            active
            title={{ width: '60%' }}
            paragraph={{ rows: 0 }}
            className='sales-amount-skeleton'
          />
        ) : (
          <span className='sales-amount'>${amount.toFixed(2)}</span>
        )}
        <p className='sales-info'>
          Previous transactions processing. Last payments may not be included.
        </p>
      </Card>
      <div className='sales-target-amount'>
        <div className='sales-item'>
          <div className='sales-item-title'>Target</div>
          <div className='sales-item-target fail'>
            <ArrowDownOutlined />
            <div className='sales-item-amount'>$12.4k</div>
          </div>
        </div>
        <div className='sales-item'>
          <div className='sales-item-title'>Last Week</div>
          <div className='sales-item-target success'>
            <ArrowUpOutlined />
            <div className='sales-item-amount'>$12.4k</div>
          </div>
        </div>
        <div className='sales-item'>
          <div className='sales-item-title'>Last Month</div>
          <div className='sales-item-target success'>
            <ArrowUpOutlined />
            <div className='sales-item-amount'>$12.4k</div>
          </div>
        </div>
      </div>
    </div>
  )
}

SalesCardItem.defaultProps = {
  title: 'Total sales made',
  percent: 0,
  amount: 0,
}

SalesCardItem.propTypes = {
  title: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  percent: PropTypes.number,
  amount: PropTypes.number,
  setQueryParams: PropTypes.func.isRequired,
}

export default SalesCardItem
