import React, { lazy } from 'react'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
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
      <Route exact path={`${path}/create`} component={AddNewProductPage} />
      <Route exact path={`${path}/:pid`} component={UpdateProductPage} />
    </Switch>
  )
}

export default ProductsPage
