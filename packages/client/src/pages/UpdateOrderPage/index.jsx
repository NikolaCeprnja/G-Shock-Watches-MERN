/* eslint-disable no-unused-vars */
import React, { useLayoutEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Spin, Button, Tabs, Table, Collapse } from 'antd'
import {
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

import { getOrderById } from '@redux/order/orderThunk'
import { clearOrderPreview, selectOrdersByType } from '@redux/order/orderSlice'

import {
  ORDER_CUSTOMER_COLUMNS,
  ORDER_STAUTS_COLUMNS,
  ORDER_PRODUCTS_COLUMNS,
} from '@shared/constants'

import './styles.scss'

const { TabPane } = Tabs
const { Panel } = Collapse

const UpdateOrderPage = ({ history }) => {
  const { oid } = useParams()
  const dispatch = useDispatch()
  const { loading, updating, data: order } = useSelector(
    selectOrdersByType('preview')
  )
  const [activeTabKey, setActiveTabKey] = useState('order-info')

  useLayoutEffect(() => {
    dispatch(getOrderById(oid))

    return () => {
      dispatch(clearOrderPreview())
    }
  }, [dispatch, oid])

  return (
    <div className='UpdateOrderPageWrapper'>
      {loading ? (
        <Spin size='large' />
      ) : (
        <div className='UpdateOrderPage'>
          <div className='caption'>
            <Button
              type='link'
              style={{ padding: 0 }}
              className='product-back-arrow'
              icon={<ArrowLeftOutlined />}
              onClick={() => history.push('/admin/e-commerce/orders')}>
              Orders
            </Button>
            <h1 className='order-title'>Order {oid}</h1>
            <p className='order-from'>
              From {order && order.customer?.userName}
            </p>
          </div>
          <Tabs
            defaultActiveKey='order-info'
            activeKey={activeTabKey}
            onTabClick={activeKey => setActiveTabKey(activeKey)}>
            <TabPane key='order-info' tab='Order Details'>
              <div className='order-info-customer'>
                <h2>
                  <UserOutlined /> Customer
                </h2>
                <Table
                  rowKey='id'
                  pagination={false}
                  loading={loading}
                  dataSource={order && [order]}
                  columns={ORDER_CUSTOMER_COLUMNS}
                />
                <div className='order-info-address'>
                  <Collapse accordion>
                    <Panel header='Shipping Address'>
                      {order?.shippingAddr}
                    </Panel>
                    <Panel header='Billing Address'>{order?.billingAddr}</Panel>
                  </Collapse>
                </div>
              </div>
              <div className='order-info-status'>
                <h2>
                  <ClockCircleOutlined /> Order Status
                </h2>
                <Table
                  rowKey={status => status.info}
                  rowSelection
                  pagination={false}
                  dataSource={order && order.status}
                  columns={ORDER_STAUTS_COLUMNS(order?.status.length || 0)}
                />
              </div>
            </TabPane>
            <TabPane key='order-products' tab='Products'>
              <div className='order-info-products'>
                <Table
                  rowKey='id'
                  pagination={false}
                  dataSource={order && order.orderedProducts}
                  columns={ORDER_PRODUCTS_COLUMNS}
                  footer={() => (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}>
                      <h2 style={{ marginBottom: '0', marginRight: '1rem' }}>
                        <span>Total:</span>{' '}
                        <b>${order?.totalAmount.toFixed(2)}</b>
                      </h2>
                    </div>
                  )}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      )}
    </div>
  )
}

UpdateOrderPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
}

export default UpdateOrderPage
