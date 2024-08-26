import React, { lazy } from 'react'
import { Switch, Route, useRouteMatch, Link } from 'react-router-dom'
import { Result } from 'antd'
import { AppstoreOutlined, AppstoreAddOutlined } from '@ant-design/icons'

import { PRODUCT_COLUMNS } from '@shared/constants'
import { selectProductsByType } from '@redux/product/productSlice'
import { getProducts } from '@redux/product/productThunk'

const DataOverviewPage = lazy(() => import('@pages/DataOverviewPage/index'))
const AddNewProductPage = lazy(() => import('@pages/AddNewProductPage/index'))
const UpdateProductPage = lazy(() => import('@pages/UpdateProductPage/index'))

const ProductsPage = () => {
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
                <AppstoreOutlined
                  style={{
                    marginRight: '0.3rem',
                    display: 'inline-flex',
                    fontSize: '2rem',
                    fontWeight: '700',
                  }}
                />
                Products
              </>
            }
            addNewIcon={<AppstoreAddOutlined />}
            dataAbout='product'
            columns={PRODUCT_COLUMNS}
            action={getProducts}
            selector={selectProductsByType('all')}
          />
        )}
      />
      <Route
        exact
        path={`${path}/create/:activeTab?`}
        component={AddNewProductPage}
      />
      <Route
        exact
        path={`${path}/:pid/:activeTab?`}
        component={UpdateProductPage}
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
            extra={<Link to={path}>Back to Products</Link>}
          />
        )}
      />
    </Switch>
  )
}

export default ProductsPage
