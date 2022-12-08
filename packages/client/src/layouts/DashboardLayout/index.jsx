import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Layout, Button } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ExportOutlined,
} from '@ant-design/icons'

import FooterContent from '@components/FooterContent/index'

import './styles.scss'

const { Header, Content, Footer, Sider } = Layout

const DashboardLayout = ({ siderMenu: SiderMenu, children }) => {
  const history = useHistory()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSiderToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Layout className='DashboardLayout'>
      <Sider
        trigger={null}
        collapsible
        collapsed={isCollapsed}
        className='dashboard-sider-wrapper'
        width={280}>
        <SiderMenu />
      </Sider>
      <Layout
        style={{
          zIndex: 3,
          transition: `margin-left 0.2s ${isCollapsed ? 'ease' : 'ease-in'}`,
          marginLeft: isCollapsed ? '80px' : '280px',
        }}>
        <Header
          style={{
            zIndex: 2,
            height: '64px',
            width: `calc(100% - ${isCollapsed ? '80px' : '280px'})`,
            position: 'fixed',
            left: isCollapsed ? '80px' : '280px',
            transition: `all 0.2s ${isCollapsed ? 'ease-out' : 'ease-in'}`,
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {React.createElement(
            isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: 'sider-trigger-btn',
              onClick: handleSiderToggle,
            }
          )}
          <Button
            type='link'
            className='home-page-btn'
            onClick={() => history.push('/')}
            icon={<ExportOutlined style={{ fontSize: '1.3rem' }} />}>
            Home
          </Button>
        </Header>
        <Content style={{ marginTop: '64px' }}>{children}</Content>
        <Footer
          style={{ color: 'rgb(168,167,167)', backgroundColor: '#1b2330' }}>
          <FooterContent />
        </Footer>
      </Layout>
    </Layout>
  )
}

DashboardLayout.defaultProps = { children: null }

DashboardLayout.propTypes = {
  children: PropTypes.node,
  siderMenu: PropTypes.func.isRequired,
}

export default DashboardLayout
