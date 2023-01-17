/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'antd'
import { AppstoreOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'

import StatisticCard from '@containers/StatisticCard/index'

import StatisticCardItem from '@components/StatisticCardItem/index'
import SalesCardItem from '@components/SalesCardItem/index'
import AreaChart from '@components/AreaChart/index'

import { getTotalProductsCount } from '@api/product/index'
import { getTotalOrdersCount, getTotalOrdersSales } from '@api/order/index'
import { getTotalUsersCount } from '@api/user/index'
import { ReactComponent as UsersIcon } from '@assets/Users.svg'

import './styles.scss'

const UsersOutlined = props => <Icon {...props} component={UsersIcon} />

const DashboardPage = ({ history }) => {
  return (
    <div className='DashboardPage'>
      <Row gutter={8}>
        <Col span={8}>
          <StatisticCard request={getTotalProductsCount}>
            {({ data: statValue, loading }) => (
              <StatisticCardItem
                loading={loading}
                about='product'
                title='Products'
                value={statValue?.totalProducts}
                redirectTo='/admin/e-commerce/products'
                icon={AppstoreOutlined}
              />
            )}
          </StatisticCard>
        </Col>
        <Col span={8}>
          <StatisticCard request={getTotalOrdersCount}>
            {({ data: statValue, loading }) => (
              <StatisticCardItem
                loading={loading}
                about='order'
                title='Orders'
                value={statValue?.totalOrders}
                redirectTo='/admin/e-commerce/orders'
                icon={ShoppingCartOutlined}
              />
            )}
          </StatisticCard>
        </Col>
        <Col span={8}>
          <StatisticCard request={getTotalUsersCount}>
            {({ data: statValue, loading }) => (
              <StatisticCardItem
                loading={loading}
                about='user'
                title='Users'
                value={statValue?.totalUsers}
                redirectTo='/admin/users'
                icon={UsersOutlined}
              />
            )}
          </StatisticCard>
        </Col>
      </Row>
      <Row style={{ margin: '1rem 0' }} gutter={8}>
        <Col span={8}>
          <StatisticCard request={getTotalOrdersSales}>
            {({ data: { totalSales } = {}, loading, setQueryParams }) => (
              <SalesCardItem
                loading={loading}
                percent={totalSales?.percent}
                amount={totalSales?.amount}
                setQueryParams={setQueryParams}
              />
            )}
          </StatisticCard>
        </Col>
        <Col span={16}>
          <StatisticCard
            request={getTotalOrdersSales}
            periodFor='last-six-months'
            wrapperClassName='area-chart-card'>
            {({ data: { totalSales } = {}, loading }) => (
              <AreaChart data={totalSales?.[0]?.data} dataKey='total.amount' />
            )}
          </StatisticCard>
        </Col>
      </Row>
    </div>
  )
}

DashboardPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
}

export default DashboardPage
