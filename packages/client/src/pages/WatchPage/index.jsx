import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { Breadcrumb } from 'antd'

import ProductPreview from '@containers/ProductPreview'

import './styles.scss'

const WatchPage = () => {
  const { gender, name, pid } = useParams()

  return (
    <div className='WatchPage'>
      <Breadcrumb className='watch-breadcrumb'>
        <Breadcrumb.Item>
          <Link to='/watches'>WATCHES</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/watches/${gender}`}>{`${gender.toUpperCase()}'S`}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/watches/${gender}?collectionName=${name}`}>
            {name.toUpperCase()}
          </Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <ProductPreview pid={pid} />
    </div>
  )
}

export default WatchPage
