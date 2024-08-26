import React, { useLayoutEffect, lazy, Suspense } from 'react'
import { Switch, Route, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Spin, Result } from 'antd'

import { selectLoggedInUser } from '@redux/user/userSlice'

const DashboardPage = lazy(() => import('@pages/DashboardPage/index'))
const ProductsPage = lazy(() => import('@pages/ProductsPage/index'))
const OrdersPage = lazy(() => import('@pages/OrdersPage/index'))
const UsersPage = lazy(() => import('@pages/UsersPage/index'))
const UserProfilePage = lazy(() => import('@pages/UserProfilePage/index'))

const AdminPanelPage = ({ history }) => {
  const loggedInUser = useSelector(selectLoggedInUser)

  useLayoutEffect(() => {
    if (!loggedInUser.info?.isAdmin)
      history.replace(`/users/${loggedInUser.info.id}/profile`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '100%',
            height: '100%',
          }}>
          <Spin size='large' />
        </div>
      }>
      <Switch>
        <Route
          exact
          path={['/admin', '/admin/dashboard']}
          component={DashboardPage}
        />
        <Route
          exact
          path={['/admin/e-commerce/products', '/admin/e-commerce/products/*']}
          component={ProductsPage}
        />
        <Route
          exact
          path={['/admin/e-commerce/orders', '/admin/e-commerce/orders/*']}
          component={OrdersPage}
        />
        <Route
          exact
          path={['/admin/users', '/admin/users/*']}
          component={UsersPage}
        />
        <Route
          exact
          path='/admin/profile/:activeTab?'
          component={UserProfilePage}
        />
        <Route
          path='*'
          render={() => (
            <Result
              style={{ margin: 'auto' }}
              status={404}
              title={
                <>
                  <strong>404</strong>
                  <p>Page Not Found</p>
                </>
              }
              subTitle="The page you are looking for doesn't exists."
              extra={<Link to='/admin/dashboard'>Back to Dashboard</Link>}
            />
          )}
        />
      </Switch>
    </Suspense>
  )
}

AdminPanelPage.propTypes = { history: PropTypes.instanceOf(Object).isRequired }

export default AdminPanelPage
