import React, { lazy } from 'react'
import { Switch, Route, useRouteMatch } from 'react-router-dom'

import { ORDERS_COLUMNS } from '@shared/constants'
import { selectAllOrders } from '@redux/order/orderSlice'
import { getOrders } from '@redux/order/orderThunk'
import OrdersIcon from '@assets/orders-icon.png'

const DataOverviewPage = lazy(() => import('@pages/DataOverviewPage/index'))
const UpdateOrderPage = lazy(() => import('@pages/UpdateOrderPage/index'))

const OrdersPage = () => {
  let { path } = useRouteMatch()

  if (path.endsWith('/*')) {
    path = path.slice(0, -2)
  }

  return (
    <Switch>
      <Route
        exact
        path={path}
        render={routeProps => (
          <DataOverviewPage
            {...routeProps}
            title={
              <>
                <img
                  alt='order-paper'
                  src={OrdersIcon}
                  style={{
                    marginRight: '0.3rem',
                    display: 'inline-flex',
                    fontSize: '2rem',
                    fontWeight: '700',
                  }}
                />
                Orders
              </>
            }
            dataAbout='order'
            addNew={false}
            columns={ORDERS_COLUMNS}
            action={getOrders}
            selector={selectAllOrders}
          />
        )}
      />
      <Route
        exact
        path={`${path}/:oid/:activeTab?`}
        component={UpdateOrderPage}
      />
    </Switch>
  )
}

export default OrdersPage
