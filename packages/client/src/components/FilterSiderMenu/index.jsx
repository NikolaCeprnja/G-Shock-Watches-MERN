import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { parse, stringify } from 'qs'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Collapse, Radio, Space, Button } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

import CollectionsFilterWrapper from '@containers/CollectionsFilterWrapper/index'
import CollectionsFilterGroup from '@components/CollectionsFilterGroup/index'

import { resetSelectedCollections } from '@redux/collection/collectionSlice'

import './styles.scss'

const { Panel } = Collapse

const FilterSiderMenu = ({ params }) => {
  const history = useHistory()
  const urlParams = useParams()
  const { search, pathname } = useLocation()
  const dispatch = useDispatch()
  const [applyFilters, setApplyFilters] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt:ascend')
  const [inStockOnly, setInStockOnly] = useState(!!params.inStockOnly || false)
  const [enableAppliedFilters, setEnableAppliedFilters] = useState(false)

  useEffect(() => {
    setSortBy(
      params.sortBy
        ? JSON.stringify(params.sortBy).replace(/["{}]/g, '')
        : 'createdAt:ascend'
    )

    setInStockOnly(!!params.inStockOnly || false)
  }, [params])

  return (
    <>
      <Collapse
        className='FilterSiderMenu'
        expandIcon={({ isActive }) =>
          isActive ? <MinusOutlined /> : <PlusOutlined />
        }
        bordered={false}
        defaultActiveKey={[1, 2, 3]}
        expandIconPosition='right'>
        <Panel
          key={1}
          header='Sort'
          showArrow={false}
          className='sort-panel'
          collapsible='disabled'>
          <Radio.Group
            name='sortBy'
            defaultValue={sortBy}
            value={sortBy}
            onChange={e => {
              const [key, value] = e.target.value.split(':')

              setSortBy(e.target.value)

              history.push({
                search: stringify(
                  { ...params, sortBy: { [key]: value } },
                  {
                    encode: false,
                    arrayFormat: 'brackets',
                    filter: (prefix, param) => {
                      if (prefix === 'gender' && 'type' in urlParams) {
                        return
                      }

                      // eslint-disable-next-line consistent-return
                      return param
                    },
                  }
                ),
              })
            }}>
            <Space direction='vertical'>
              <Radio value='createdAt:ascend'>Newest</Radio>
              <Radio value='price:descend'>Price: High-Low</Radio>
              <Radio value='price:ascend'>Price: Low-High</Radio>
              <Radio value='numReviews:descend'>Reviews: High-Low</Radio>
              <Radio value='numReviews:ascend'>Reviews: Low-High</Radio>
            </Space>
          </Radio.Group>
        </Panel>
        <Panel key={2} header='Availability'>
          <Radio.Button
            name='inStock'
            checked={inStockOnly}
            defaultChecked={inStockOnly}
            onClick={() => {
              const existingParams = parse(search, {
                ignoreQueryPrefix: true,
              })

              setInStockOnly(prevState => {
                if (!prevState) {
                  existingParams.inStockOnly = true
                } else {
                  delete existingParams.inStockOnly
                }

                history.push({
                  search: stringify(existingParams, {
                    encode: false,
                    arrayFormat: 'brackets',
                  }),
                })

                return !prevState
              })
            }}>
            In Stock Only
          </Radio.Button>
        </Panel>
        <Panel key={3} header='Collections'>
          {params.gender ? (
            <CollectionsFilterWrapper
              params={params}
              applyFilters={applyFilters}
              setApplyFilters={setApplyFilters}
              setEnableAppliedFilters={setEnableAppliedFilters}>
              {({
                queryParams: { gender, ...restParams },
                enableFiltersBtn,
              }) => (
                <CollectionsFilterGroup
                  name='collectionName'
                  params={{ ...restParams }}
                  gender={gender}
                  setEnableAppliedFilters={enableFiltersBtn}
                />
              )}
            </CollectionsFilterWrapper>
          ) : (
            <CollectionsFilterWrapper
              params={params}
              applyFilters={applyFilters}
              setApplyFilters={setApplyFilters}
              setEnableAppliedFilters={setEnableAppliedFilters}
            />
          )}
        </Panel>
      </Collapse>
      <div className='filterActions'>
        <Button
          type='primary'
          size='middle'
          disabled={!enableAppliedFilters}
          onClick={() => {
            setApplyFilters(true)
          }}>
          Apply filters
        </Button>
        <Button
          danger
          size='middle'
          disabled={
            !Object.keys(params).length > 0 ||
            (Object.keys(params).length === 1 && params.gender)
          }
          onClick={() => {
            history.push(pathname)
            if (enableAppliedFilters) {
              setEnableAppliedFilters(false)
            }
            dispatch(resetSelectedCollections({ gender: params.gender }))
          }}>
          Reset all filters
        </Button>
      </div>
    </>
  )
}

FilterSiderMenu.propTypes = {
  params: PropTypes.instanceOf(Object).isRequired,
}

export default FilterSiderMenu
