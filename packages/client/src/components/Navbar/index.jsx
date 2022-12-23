import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Layout, Menu, Skeleton } from 'antd'

import CartDropdownMenu from '@containers/CartDropdownMenu/index'
import CollectionDropdownMenu from '@containers/CollectionDropdownMenu/index'

import AvatarDropdownMenu from '@components/AvatarDropdownMenu/index'

import { selectLoggedInUser } from '@redux/user/userSlice'

import { ReactComponent as Logo } from '@assets/GShock_logo.svg'

import './styles.scss'

const { Header } = Layout
const { Item } = Menu

const Navbar = () => {
  const history = useHistory()
  const { pathname } = useLocation()
  const loggedInUser = useSelector(selectLoggedInUser)
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    if (pathname.charAt(pathname.length - 1) === '/') {
      return setSelectedKeys(pathname.slice(0, -1))
    }

    return setSelectedKeys(pathname)
  }, [pathname])

  return (
    <Header style={{ position: 'fixed', zIndex: '1050', width: '100%' }}>
      <Menu
        theme='dark'
        mode='horizontal'
        className='main-navbar'
        selectedKeys={selectedKeys}
        onClick={e => {
          history.push(e.key)
        }}>
        <Item key='/'>
          <Logo className='logo' />
        </Item>
        <Item key='/watches/men' className='collection-dropdown-item'>
          <CollectionDropdownMenu gender='men' skeletons={7} />
        </Item>
        <Item key='/watches/women' className='collection-dropdown-item'>
          <CollectionDropdownMenu gender='women' skeletons={3} />
        </Item>
        <Item key='/watches'>Watches</Item>
        <Item key='/watches/limited-edition'>Limited Edition</Item>
        <Item
          disabled
          className='shopping-cart'
          style={{ color: '#fff', opacity: 1 }}>
          <CartDropdownMenu />
        </Item>
        {!loggedInUser.info &&
          !loggedInUser.loading &&
          loggedInUser.auth === 'unauthenticated' && (
            <Item key='/auth/signin'>Sign In</Item>
          )}
        {!loggedInUser.info &&
          (loggedInUser.loading || loggedInUser.auth === 'authenticating') && (
            <Skeleton.Avatar
              active
              shape='circle'
              className='main-avatar-skeleton'
            />
          )}
        {loggedInUser.info && !loggedInUser.loading && (
          <AvatarDropdownMenu key='avatar-dropdown' info={loggedInUser.info} />
        )}
      </Menu>
    </Header>
  )
}

export default Navbar
