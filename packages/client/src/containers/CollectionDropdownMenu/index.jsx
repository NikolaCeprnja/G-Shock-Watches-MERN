import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Menu, Skeleton } from 'antd'

import CollectionItem from '@components/CollectionItem/index'

import { getCollectionsByGender } from '@redux/collection/collectionSlice'

const CollectionDropdownMenu = ({ gender, skeletons }) => {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const match = useRouteMatch('/watches/:type')
  const dispatch = useDispatch()
  const collections = useSelector(state => state.collections[gender])
  const { loading, data } = collections
  const [isVisible, setIsVisible] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    const query = new URLSearchParams(search)

    if (query.has('collection') && match.params?.type === gender) {
      return setSelectedKeys(
        `/watches/${gender}?collection=${query.get('collection')}`
      )
    }

    return setSelectedKeys()
  }, [pathname, search, match, gender])

  const handleVisibleChange = async visible => {
    setIsVisible(visible)

    if (visible && !data) {
      try {
        const response = await dispatch(getCollectionsByGender(gender))
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    }
  }

  return (
    <Dropdown
      placement='bottomLeft'
      overlayClassName='collection-dropdown-menu'
      visible={isVisible}
      onVisibleChange={handleVisibleChange}
      onClick={() => setIsVisible(false)}
      overlay={
        <Menu
          theme='dark'
          selectable
          selectedKeys={selectedKeys}
          onClick={async e => {
            e.domEvent.stopPropagation()
            setIsVisible(false)
            await history.push(e.key)
          }}>
          {loading
            ? [...Array(skeletons)].map((e, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px',
                  }}>
                  <Skeleton.Image style={{ width: '150px' }} />
                  <Skeleton paragraph={{ rows: 0 }} />
                </div>
              ))
            : data?.length > 0 &&
              data.map(({ name, ...rest }) => {
                return (
                  <CollectionItem
                    key={`/watches/${gender}?collection=${name}`}
                    name={name}
                    {...rest}
                  />
                )
              })}
          {!loading && !data?.length && (
            <div>There is no collections for {gender}</div>
          )}
        </Menu>
      }>
      <div style={{ textTransform: 'capitalize' }}>{gender}</div>
    </Dropdown>
  )
}

CollectionDropdownMenu.propTypes = {
  gender: PropTypes.string.isRequired,
  skeletons: PropTypes.number.isRequired,
}

export default CollectionDropdownMenu
