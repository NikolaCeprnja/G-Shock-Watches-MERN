import React, { useMemo, useState, lazy } from 'react'
import { parse } from 'qs'
import { useParams, useLocation, Switch, Route } from 'react-router-dom'

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
      <Route exact path='/watches/:gender?/:name/:pid' component={WatchPage} />
    </Switch>
  )
}

export default WatchesPage
