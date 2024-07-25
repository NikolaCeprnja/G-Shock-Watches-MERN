import React, { useMemo, useState, lazy } from 'react'
import { parse } from 'qs'
import { useParams, useLocation, Switch, Route, Link } from 'react-router-dom'
import { Result } from 'antd'

import ProductsPreview from '@containers/ProductsPreview/index'

import { getProducts } from '@redux/product/productThunk'

import './styles.scss'

const WatchPage = lazy(() => import('@pages/WatchPage/index'))

const WatchesPage = () => {
  const params = useParams()
  const { search } = useLocation()
  const [queryParams, setQueryParams] = useState()

  useMemo(() => {
    const urlQueryParams = parse(search, { ignoreQueryPrefix: true })

    if (params.type === 'men' || params.type === 'women') {
      urlQueryParams.gender = params.type
    } else if (params.type === 'limited-edition') {
      urlQueryParams.collectionName = params.type
        .split('-')
        .join(' ')
        .toUpperCase()
    }

    Object.entries(urlQueryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'collectionName') {
          urlQueryParams[key] = value.map(val => val.toUpperCase())
          return
        }

        urlQueryParams[key] = value.map(val => val.toLowerCase())
        return
      }

      if (key === 'collectionName') {
        urlQueryParams[key] = value.toUpperCase()
      }
    })

    setQueryParams(urlQueryParams)
  }, [params, search])

  return (
    <Switch>
      <Route exact path={['/watches', '/watches/:type']}>
        <div className='WatchesPage'>
          <ProductsPreview
            type='all'
            withSider
            action={getProducts}
            params={queryParams}
            title={
              <>
                <h2>G-Shock Watches</h2>
                <span>(Filter products to narrow your search)</span>
                <hr />
              </>
            }
          />
        </div>
      </Route>
      <Route exact path='/watches/:gender/:name/:pid' component={WatchPage} />
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
            extra={<Link to='/'>Back to Home</Link>}
          />
        )}
      />
    </Switch>
  )
}

export default WatchesPage
