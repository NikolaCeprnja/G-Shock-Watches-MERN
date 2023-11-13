import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { stringify } from 'qs'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Collapse, Checkbox } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

import CollectionsFilterGroup from '@components/CollectionsFilterGroup/index'

import {
  selectCollections,
  selectCurrentlySelectedCollections,
} from '@redux/collection/collectionSlice'

const { Panel } = Collapse

const CollectionsFilterWrapper = ({
  children,
  params,
  applyFilters,
  setApplyFilters,
  setEnableAppliedFilters,
}) => {
  const dispatch = useDispatch()
  const collections = useSelector(selectCollections)
  const currSelectedCollections = useSelector(
    selectCurrentlySelectedCollections()
  )
  const history = useHistory()
  const urlParams = useParams()
  const { search, pathname } = useLocation()
  const pathRef = useRef(pathname)
  const [activeCollectionKey, setActiveCollectionKey] = useState()

  const handleAppliedFilters = useCallback(() => {
    setEnableAppliedFilters(false)

    if (currSelectedCollections.length > 0) {
      let alreadyFetchedProducts

      if (Array.isArray(params?.collectionName)) {
        if (params.collectionName.length !== currSelectedCollections.length) {
          alreadyFetchedProducts = false
        } else {
          alreadyFetchedProducts = currSelectedCollections.every(({ name }) =>
            params.collectionName.includes(name)
          )
        }
      } else if (typeof params.collectionName === 'string') {
        alreadyFetchedProducts = currSelectedCollections.every(
          ({ name }) => params.collectionName === name
        )
      }

      if (!alreadyFetchedProducts) {
        const appliedFilters = currSelectedCollections.map(({ name }) => name)

        history.push({
          search: stringify(
            {
              ...params,
              collectionName: appliedFilters,
            },
            {
              encode: false,
              arrayFormat: 'brackets',
              filter: (prefix, value) => {
                if (prefix === 'gender' && 'type' in urlParams) {
                  return
                }

                if (typeof value === 'string') {
                  value = value.toLowerCase()
                }
                // eslint-disable-next-line consistent-return
                return value
              },
            }
          ),
        })
      }
    } else if (params.collectionName) {
      delete params.collectionName

      history.push({
        search: stringify(
          { ...params },
          {
            encode: false,
            arrayFormat: 'brackets',
            filter: (prefix, value) => {
              if (prefix === 'gender' && 'type' in urlParams) {
                return
              }

              if (typeof value === 'string') {
                value = value.toLowerCase()
              }
              // eslint-disable-next-line consistent-return
              return value
            },
          }
        ),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections])

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname
      setActiveCollectionKey([])
      setEnableAppliedFilters(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, dispatch])

  useEffect(() => {
    if (applyFilters) {
      handleAppliedFilters()
      setApplyFilters(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilters, setApplyFilters])

  return params.gender ? (
    children({
      queryParams: params,
      enableFiltersBtn: setEnableAppliedFilters,
    })
  ) : (
    <Collapse
      bordered={false}
      activeKey={activeCollectionKey}
      expandIconPosition='right'
      onChange={key => {
        setActiveCollectionKey(key)
      }}
      expandIcon={({ isActive }) =>
        isActive ? <MinusOutlined /> : <PlusOutlined />
      }>
      <Panel key='men' header='Men'>
        <CollectionsFilterGroup
          gender='men'
          name='collectionName'
          params={params}
          setEnableAppliedFilters={setEnableAppliedFilters}
        />
      </Panel>
      <Panel key='women' header='Women'>
        <CollectionsFilterGroup
          gender='women'
          name='collectionName'
          params={params}
          setEnableAppliedFilters={setEnableAppliedFilters}
        />
      </Panel>
      <Panel key='limited-edition' header='Special'>
        <Checkbox.Group
          name='collectionName'
          value={currSelectedCollections.map(({ name }) => name)}
          defaultValue={params?.collectionName}
          options={[{ label: 'LIMITED-EDITION', value: 'LIMITED EDITION' }]}
          onChange={value => {
            const { collectionName = [], ...existingParams } = params

            history.push({
              search: stringify(
                {
                  ...existingParams,
                  collectionName: collectionName.concat(
                    value.map(val => val.toLowerCase())
                  ),
                },
                {
                  encode: false,
                  arrayFormat: 'brackets',
                }
              ),
            })
          }}
        />
      </Panel>
    </Collapse>
  )
}

CollectionsFilterWrapper.defaultProps = {
  children: null,
}

CollectionsFilterWrapper.propTypes = {
  children: PropTypes.func,
  params: PropTypes.instanceOf(Object).isRequired,
  applyFilters: PropTypes.bool.isRequired,
  setApplyFilters: PropTypes.func.isRequired,
  setEnableAppliedFilters: PropTypes.func.isRequired,
}

export default CollectionsFilterWrapper
