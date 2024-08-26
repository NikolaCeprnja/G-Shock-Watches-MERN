import React from 'react'

import OffersCarousel from '@containers/OffersCarousel/index'
import ProductsPreview from '@containers/ProductsPreview/index'

import {
  getLatestProducts,
  getTopRatedProducts,
} from '@redux/product/productThunk'

import './styles.scss'

const HomePage = () => {
  return (
    <div className='HomePage'>
      <OffersCarousel />
      <ProductsPreview
        title={
          <>
            <h2>New watches</h2>
            <hr />
          </>
        }
        action={getLatestProducts}
        type='latest'
        skeletons={4}
      />
      <ProductsPreview
        title={
          <>
            <h2 style={{ marginTop: 0 }}>Top rated products</h2>
            <hr />
          </>
        }
        action={getTopRatedProducts}
        type='topRated'
      />
    </div>
  )
}

export default HomePage
