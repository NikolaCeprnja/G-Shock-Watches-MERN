import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Checkbox, Spin } from 'antd'

import {
  toggleSelectedCollections,
  resetSelectedCollections,
  selectCollectionsByGender,
  selectCurrentlySelectedCollectionsByGender,
} from '@redux/collection/collectionSlice'
import { getCollectionsByGender } from '@redux/collection/collectionThunk'

const CollectionsFilterGroup = ({
  name,
  params,
  gender,
  setEnableAppliedFilters,
}) => {
  const { search } = useLocation()
  const dispatch = useDispatch()
  const collections = useSelector(selectCollectionsByGender(gender))
  const currSelectedCollections = useSelector(
    selectCurrentlySelectedCollectionsByGender(gender)
  )
  const [generatedOptions, setGeneratedOptions] = useState([])

  useEffect(() => {
    if (!collections.data) {
      dispatch(
        getCollectionsByGender({
          gender,
          urlQueryParams: params.collectionName,
        })
      )
    }

    return () => {
      if (
        (!params.collectionName && currSelectedCollections.length > 0) ||
        currSelectedCollections.length > 0
      ) {
        dispatch(resetSelectedCollections({ gender }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, gender])

  useEffect(() => {
    if (collections.data) {
      if (!params.collectionName && currSelectedCollections.length > 0) {
        setEnableAppliedFilters(false)
        dispatch(resetSelectedCollections({ gender }))
        return
      }

      switch (true) {
        case typeof params.collectionName === 'string' &&
          currSelectedCollections.length === 1 &&
          currSelectedCollections[0] !== params.collectionName:
        case typeof params.collectionName === 'string' &&
          (currSelectedCollections.length > 1 ||
            currSelectedCollections.length === 0):
        case Array.isArray(params.collectionName) &&
          params.collectionName.length !== currSelectedCollections.length:
        case Array.isArray(params.collectionName) &&
          params.collectionName.length > 0 &&
          currSelectedCollections.length === 0:
        case Array.isArray(params.collectionName) &&
          params.collectionName.length === currSelectedCollections.length &&
          !params.collectionName?.every(appliedFilter =>
            currSelectedCollections.includes(appliedFilter)
          ): {
          dispatch(
            toggleSelectedCollections({
              value: params.collectionName,
              gender,
            })
          )
          setEnableAppliedFilters(false)
          break
        }
        default: {
          setEnableAppliedFilters(false)
          break
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search])

  useMemo(() => {
    if (collections?.data?.length > 0) {
      const filterOptions = collections.data.map(
        ({ name: collectionName }) => ({
          label: collectionName,
          value: collectionName,
        })
      )

      setGeneratedOptions(filterOptions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections.data])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {collections.loading ? (
        <Spin />
      ) : (
        <Checkbox.Group
          name={name}
          defaultValue={params?.[name]}
          value={currSelectedCollections}
          options={generatedOptions}
          onChange={value => {
            dispatch(toggleSelectedCollections({ value, gender }))

            if (value.length === 0 && !params?.collectionName) {
              setEnableAppliedFilters(false)
              return
            }

            if (Array.isArray(params.collectionName)) {
              if (value.length === 0 && params.collectionName.length > 0) {
                setEnableAppliedFilters(true)
                return
              }

              if (
                value.length === params.collectionName.length &&
                value.every(currSelectedVal =>
                  params.collectionName.includes(currSelectedVal)
                )
              ) {
                setEnableAppliedFilters(false)
                return
              }

              setEnableAppliedFilters(true)
              return
            }

            if (
              value.length > 0 &&
              value.every(
                currSelectedVal => currSelectedVal === params.collectionName
              )
            ) {
              setEnableAppliedFilters(false)
              return
            }

            setEnableAppliedFilters(true)
          }}
        />
      )}
    </div>
  )
}

CollectionsFilterGroup.defaultProps = {
  params: {},
}

CollectionsFilterGroup.propTypes = {
  name: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  params: PropTypes.instanceOf(Object),
  setEnableAppliedFilters: PropTypes.func.isRequired,
}

export default CollectionsFilterGroup
