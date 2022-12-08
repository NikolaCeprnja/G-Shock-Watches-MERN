import React from 'react'
import PropTypes from 'prop-types'
import { Layout } from 'antd'

import Navbar from '@components/Navbar/index'
import FooterContent from '@components/FooterContent/index'

const { Content, Footer } = Layout

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ background: 'unset' }}>
      <Navbar />
      <Content
        style={{ display: 'flex', flexDirection: 'column', marginTop: '64px' }}>
        {children}
      </Content>
      <Footer
        style={{
          color: '#fff',
          backgroundColor: '#001529',
        }}>
        <FooterContent />
      </Footer>
    </Layout>
  )
}

MainLayout.defaultProps = {
  children: null,
}

MainLayout.propTypes = {
  children: PropTypes.node,
}

export default MainLayout
