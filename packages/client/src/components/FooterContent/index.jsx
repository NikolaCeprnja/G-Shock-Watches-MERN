import React from 'react'

import { ReactComponent as CasioLogo } from '@assets/Casio_logo.svg'

import './styles.scss'

const FooterContent = () => {
  return (
    <div className='footer-content'>
      <CasioLogo className='casio-logo' />
      <p className='footer-rights'>
        ALL RIGHTS RESERVED. 2006.-{new Date().getFullYear()}. CASIO AMERICA
        INC.
      </p>
    </div>
  )
}

export default FooterContent
