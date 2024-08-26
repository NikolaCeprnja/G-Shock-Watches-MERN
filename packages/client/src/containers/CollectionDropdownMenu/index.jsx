import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useErrorBoundary } from 'react-error-boundary'
import { Dropdown, Menu, Skeleton, Empty } from 'antd'

import CollectionItem from '@components/CollectionItem/index'

import {
  selectCollectionsByGender,
  toggleSelectedCollections,
} from '@redux/collection/collectionSlice'
import { getCollectionsByGender } from '@redux/collection/collectionThunk'

import { handleAsyncThunkError } from '@utils/asyncThunkErrorHandler'

const CollectionDropdownMenu = ({ gender, skeletons }) => {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const match = useRouteMatch('/watches/:type')
  const dispatch = useDispatch()
  const { loading, data } = useSelector(selectCollectionsByGender(gender))
  const collRef = useRef()
  const { showBoundary } = useErrorBoundary()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [errMsg, setErrMsg] = useState()

  useEffect(() => {
    return () => {
      collRef.current?.abort?.('Request Aborted due to component unmount.')
    }
  }, [])

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

  const handleVisibleChange = useCallback(
    async visible => {
      setIsVisible(visible)

      if (visible && !data && !loading) {
        try {
          collRef.current = dispatch(getCollectionsByGender(gender))
          await collRef.current?.unwrap?.()
        } catch (err) {
          handleAsyncThunkError(err, showBoundary, {
            showBoundaryOnlyOnServerError: true,
          })

          if (err.name !== 'AbortError') {
            const { data: { message } = { message: undefined } } = err
            setErrMsg(message)
          }
        }
      }
    },
    [dispatch, gender, data, loading, showBoundary]
  )

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
            <Empty
              style={{ color: '#fff', padding: '2rem 0' }}
              description={errMsg || `There is no collections for ${gender}`}
            />
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
