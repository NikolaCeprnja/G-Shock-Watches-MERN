import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Menu, Skeleton } from 'antd'

import CollectionItem from '@components/CollectionItem/index'

import {
  selectCollectionsByGender,
  toggleSelectedCollections,
} from '@redux/collection/collectionSlice'
import { getCollectionsByGender } from '@redux/collection/collectionThunk'

const CollectionDropdownMenu = ({ gender, skeletons }) => {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const match = useRouteMatch('/watches/:type')
  const dispatch = useDispatch()
  const { loading, data } = useSelector(selectCollectionsByGender(gender))
  const [isVisible, setIsVisible] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    const query = new URLSearchParams(search)

    if (query.has('collectionName') && match?.params?.type === gender) {
      return setSelectedKeys(
        `/watches/${gender}?collectionName=${query
          .get('collectionName')
          .toLowerCase()}`
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
            /* prevent pushing the same path into the history stack which will cause 
            unnecessary re-rendering and data fetching for already fetched data on each click */
            if (decodeURI(pathname + search) !== e.key) {
              const collName = e.key.slice(e.key.indexOf('=') + 1).toUpperCase()

              dispatch(
                toggleSelectedCollections({
                  value: collName,
                  gender,
                })
              )

              history.push(e.key)
            }

            setIsVisible(false)
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
                    padding: '12px',
                  }}>
                  <Skeleton.Image
                    style={{ width: 'calc(14vw * 0.88)', height: '14vw' }}
                  />
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
                  key={`/watches/${gender}?collectionName=${name.toLowerCase()}`}
                  name={name}
                  {...rest}
                />
              ))}
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
