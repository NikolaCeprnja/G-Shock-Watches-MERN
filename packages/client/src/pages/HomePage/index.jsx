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
        title='New watches'
        action={getLatestProducts}
        type='latest'
        skeletons={4}
      />
      <ProductsPreview
        title='Top rated products'
        action={getTopRatedProducts}
        type='topRated'
      />
    </div>
  )
}

export default HomePage
