import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Menu, Image } from 'antd'
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'

import { ReactComponent as Logo } from '@assets/GShock_logo.svg'
import { ReactComponent as UsersIcon } from '@assets/Users.svg'

import { signout } from '@redux/user/userThunk'
import { selectLoggedInUser } from '@redux/user/userSlice'
import { removeAll as removeAllNotifications } from '@redux/notification/notificationSlice'

import './styles.scss'

const { SubMenu, Item, Divider } = Menu
const UsersOutlined = props => <Icon {...props} component={UsersIcon} />

const AdminSiderMenu = ({ collapsed }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()
  const loggedInUser = useSelector(selectLoggedInUser)
  const [openKeys, setOpenKeys] = useState([pathname.split('/', 3).join('/')])
  const [selectedKeys, setSelectedKeys] = useState(['/admin/dashboard'])

  useEffect(() => {
    switch (true) {
      case pathname === '/admin': {
        setSelectedKeys(['/admin/dashboard'])
        break
      }
      case pathname.charAt(pathname.length - 1) === '/': {
        if (pathname.slice(0, -1) === '/admin') {
          setSelectedKeys(['/admin/dashboard'])
          break
        }

        setSelectedKeys([pathname.slice(0, -1)])
        break
      }
      case pathname.startsWith('/profile', 6): {
        setSelectedKeys(['/admin/profile'])
        break
      }
      default: {
        setSelectedKeys([pathname])
      }
    }

    if (
      (pathname.startsWith('/users', 6) ||
        pathname.startsWith('/e-commerce', 6)) &&
      !collapsed
    ) {
      setOpenKeys([pathname.split('/', 3).join('/')])
    } else {
      setOpenKeys([])
    }
  }, [pathname, collapsed])

  const handleMenuClick = e => {
    if (e.keyPath.length > 1) {
      setOpenKeys([e.keyPath[e.keyPath.length - 1]])
    } else {
      setOpenKeys([])
    }

    if (e.key !== 'signout') {
      history.push(e.key)
      return
    }

    history.push('/')
    dispatch(signout())
    dispatch(removeAllNotifications())
  }

  const handleSubMenuOpen = keys => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1)
    return latestOpenKey ? setOpenKeys([latestOpenKey]) : setOpenKeys([])
  }

  return (
    <Menu
      mode='inline'
      theme='dark'
      className='AdminSiderMenu'
      onClick={handleMenuClick}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={handleSubMenuOpen}>
      <Item
        key='userName'
        className='user-info'
        disabled
        style={{ color: '#fff', opacity: 1 }}>
        <Logo style={{ width: '100px', marginBottom: '2rem' }} />
        <h3 className='user-name'>{loggedInUser.info?.userName}</h3>
        <h4 className='user-email'>{loggedInUser.info?.email}</h4>
        <div className='avatar-wrapper'>
          {loggedInUser.info?.photo || loggedInUser.info?.avatarUrl ? (
            <Image
              preview={false}
              width={80}
              height={80}
              src={loggedInUser.info.photo || loggedInUser.info.avatarUrl}
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <span className='user-photo'>
              <UserOutlined />
            </span>
          )}
        </div>
      </Item>
      <Item
        key='/admin/dashboard'
        style={{ fontSize: '1rem', fontWeight: '500' }}
        icon={<DashboardOutlined style={{ fontSize: '1.3rem' }} />}>
        Dashboard
      </Item>
      <SubMenu
        key='/admin/e-commerce'
        title='E-Commerce'
        className='admin-sider-submenu'
        icon={<ShoppingCartOutlined style={{ fontSize: '1.3rem' }} />}>
        <Item key='/admin/e-commerce/products'>Products</Item>
        <Item key='/admin/e-commerce/products/create'>Add New Product</Item>
        <Item key='/admin/e-commerce/orders'>Orders</Item>
      </SubMenu>
      <SubMenu
        key='/admin/users'
        title='Users'
        className='admin-sider-submenu'
        icon={<UsersOutlined style={{ fontSize: '1.3rem' }} />}>
        <Item key='/admin/users'>Users</Item>
        <Item key='/admin/users/create'>Add New User</Item>
      </SubMenu>
      <Item
        key='/admin/profile'
        style={{ fontSize: '1rem', fontWeight: '500' }}
        icon={<UserOutlined style={{ fontSize: '1.3rem' }} />}>
        Profile
      </Item>
      <Divider className='admin-menu-divider' />
      <Item
        key='signout'
        className='signout-menu-item'
        icon={<LogoutOutlined />}
        danger>
        Sign out
      </Item>
    </Menu>
  )
}

AdminSiderMenu.propTypes = {
  collapsed: PropTypes.bool.isRequired,
}

export default AdminSiderMenu
