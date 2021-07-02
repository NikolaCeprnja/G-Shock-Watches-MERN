import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Menu, Skeleton, Button } from 'antd'

import CollectionItem from '@components/CollectionItem/index'

import {
  selectCollectionByGender,
  getCollectionsByGender,
} from '@redux/collection/collectionSlice'

const CollectionDropdownMenu = ({ gender, skeletons }) => {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const match = useRouteMatch('/watches/:type')
  const dispatch = useDispatch()
  const { loading, data } = useSelector(selectCollectionByGender(gender))
  const [isVisible, setIsVisible] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    const query = new URLSearchParams(search)

    if (query.has('collection') && match.params?.type === gender) {
      return setSelectedKeys(
        `/watches/${gender}?collection=${query.get('collection').toLowerCase()}`
      )
    }

    return setSelectedKeys()
  }, [pathname, search, match, gender])

  const handleVisibleChange = visible => {
    setIsVisible(visible)

    if (visible && !data && !loading) {
      dispatch(getCollectionsByGender(gender))
    }
  }

  return (
    <Dropdown
      overlayClassName='collection-dropdown-menu'
      visible={isVisible}
      onVisibleChange={handleVisibleChange}
      onClick={() => setIsVisible(false)}
      overlay={
        <Menu
          theme='dark'
          selectable
          selectedKeys={selectedKeys}
          onClick={e => {
            e.domEvent.stopPropagation()
            setIsVisible(false)
            history.push(e.key)
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                  }}>
                  <Skeleton.Image style={{ width: '160px', height: '160px' }} />
                  <Skeleton
                    active
                    className='collection-item-skeleton'
                    paragraph={{ rows: 0 }}
                  />
                </div>
              ))
            : data?.length > 0 &&
              data.map(({ name, ...rest }) => (
                <CollectionItem
                  key={`/watches/${gender}?collection=${name.toLowerCase()}`}
                  name={name}
                  {...rest}
                />
              ))}
          {!loading && !data?.length && (
            <div>There is no collections for {gender}</div>
          )}
          <li>
            <Button
              size='large'
              style={{
                textTransform: 'capitalize',
              }}
              onClick={() =>
                setIsVisible(false)
              }>{`Shop ${gender}'s watches`}</Button>
          </li>
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
