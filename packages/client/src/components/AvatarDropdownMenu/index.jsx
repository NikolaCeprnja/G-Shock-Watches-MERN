import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Dropdown, Menu, Avatar, Image } from 'antd'
import {
  UserOutlined,
  AreaChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

import { signout } from '@redux/user/userThunk'
import { removeAll as removeAllNotifications } from '@redux/notification/notificationSlice'

import './styles.scss'

const { Divider, Item, SubMenu } = Menu

const AvatarDropdownMenu = ({
  info: { id, userName, email, isAdmin, avatarUrl, photo },
}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedKey, setSelectedKey] = useState('')

  useEffect(() => {
    if (pathname.charAt(pathname.length - 1) === '/') {
      return setSelectedKey(pathname.slice(0, -1))
    }

    return setSelectedKey(pathname)
  }, [pathname])

  const handleMenuClick = e => {
    setIsVisible(false)

    if (e.key !== 'signout') {
      history.push(e.key)
      return
    }

    history.push('/')
    dispatch(signout())
    dispatch(removeAllNotifications())
  }

  const handleVisibleChange = visible => {
    setIsVisible(visible)
  }

  return (
    <Dropdown
      visible={isVisible}
      onVisibleChange={handleVisibleChange}
      overlayStyle={{
        position: 'fixed',
      }}
      overlay={
        <Menu selectable selectedKeys={[selectedKey]} onClick={handleMenuClick}>
          <Item key='userName' className='user-info' disabled>
            {photo || avatarUrl ? (
              <Image
                preview={false}
                width={80}
                height={80}
                src={photo || avatarUrl}
                style={{ borderRadius: '50%' }}
              />
            ) : (
              <span className='user-photo'>
                <UserOutlined />
              </span>
            )}
            <span className='user-name'>{userName}</span>
            <span className='user-email'>{email}</span>
          </Item>
          <Divider />
          <SubMenu
            popupClassName='user-actions-submenu'
            className={
              selectedKey === `/users/${id}/profile` &&
              'dropdown-menu-title-active'
            }
            key={`/users/${id}/profile`}
            icon={<UserOutlined />}
            title='Your Profile'
            onTitleClick={e => {
              setIsVisible(false)
              history.push(e.key)
            }}>
            <Item key={`/users/${id}/profile/reviews`}>Reviews</Item>
            <Item key={`/users/${id}/profile/purchased-products`}>
              Purchased products
            </Item>
            <Item key={`/users/${id}/profile/settings`}>Settings</Item>
          </SubMenu>
          {isAdmin && (
            <Item key='/admin/dashboard' icon={<AreaChartOutlined />}>
              Admin panel
            </Item>
          )}
          <Divider />
          <Item key='signout' icon={<LogoutOutlined />} danger>
            Sign out
          </Item>
        </Menu>
      }>
      <Avatar
        className='main-avatar'
        src={photo || avatarUrl}
        icon={<UserOutlined />}
      />
    </Dropdown>
  )
}

AvatarDropdownMenu.propTypes = {
  info: PropTypes.instanceOf(Object).isRequired,
}

export default AvatarDropdownMenu
