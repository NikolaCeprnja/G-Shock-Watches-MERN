import React from 'react'
import PropTypes from 'prop-types'
import { Layout } from 'antd'
import { ErrorBoundary } from 'react-error-boundary'

import ErrorFallback from '@components/ErrorFallback/index'
import FooterContent from '@components/FooterContent/index'

const { Content, Footer } = Layout

const AuthLayout = ({ children }) => {
  return (
    <Layout style={{ background: 'unset' }}>
      <Content style={{ display: 'flex', justifyContent: 'center' }}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children}
        </ErrorBoundary>
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

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthLayout
