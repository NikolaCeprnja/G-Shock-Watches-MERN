import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import PropTypes from 'prop-types'
import { parse, stringify } from 'qs'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Input, Button, Empty } from 'antd'

import './styles.scss'

const { Search } = Input

const DataOverviewPage = ({
  history,
  title,
  addNew,
  addNewIcon,
  dataAbout,
  columns,
  action,
  selector,
}) => {
  const dispatch = useDispatch()
  const { pathname, search } = useLocation()
  const searchQueryParam = useRef('')
  const [errMsg, setErrMsg] = useState('')
  const [defaultColumns, setDefaultColumns] = useState()
  const [defaultSearchValue, setDefaultSearchValue] = useState('')
  const selectedInfo = useSelector(selector)

  useLayoutEffect(() => {
    const urlSearchQueryParams = parse(search, { ignoreQueryPrefix: true })
    const defaultFilteredValues = {}
    let defaultSortOrder

    Object.entries(urlSearchQueryParams).forEach(([key, value]) => {
      // eslint-disable-next-line default-case
      switch (key) {
        case 'collectionName':
        case 'isAdmin':
        case 'status': {
          defaultFilteredValues[key] = value
          break
        }
        case 'sortBy': {
          defaultSortOrder = value
          break
        }
        case 'searchTerm': {
          searchQueryParam.current = value
          setDefaultSearchValue(value)
          break
        }
      }
    })

    setDefaultColumns(columns(defaultFilteredValues, defaultSortOrder))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlSearchQueryParams = parse(search, { ignoreQueryPrefix: true })
        await dispatch(action(urlSearchQueryParams)).unwrap()
      } catch (err) {
        const {
          data: { message },
        } = err

        if (err.status !== 'ABORTED') {
          setErrMsg(message)
        }
      }
    }

    fetchData()
  }, [action, dispatch, search])

  const handleOnSearch = useCallback(
    (value, event) => {
      const queryParams = parse(search, { ignoreQueryPrefix: true })
      delete queryParams.page

      if (value.length > 0 && searchQueryParam.current !== value) {
        searchQueryParam.current = value
        queryParams.searchTerm = value
        history.push({
          search: stringify(queryParams, {
            encode: false,
            addQueryPrefix: true,
            arrayFormat: 'brackets',
          }),
        })
      } else if (searchQueryParam.current !== value) {
        searchQueryParam.current = value
        delete queryParams.searchTerm
        history.push({
          search: stringify(queryParams, {
            encode: false,
            addQueryPrefix: true,
            arrayFormat: 'brackets',
          }),
        })
      }
    },
    [history, search]
  )

  return (
    <div className='DataOverviewPage'>
      <div className='caption-background' />
      <div className='caption'>
        <h1 className='title'>{title}</h1>
        <Search
          key={defaultSearchValue}
          className='data-overview-search'
          allowClear
          enterButton
          size='large'
          defaultValue={defaultSearchValue}
          placeholder={`Search for specific ${dataAbout}`}
          onSearch={handleOnSearch}
        />
        {addNew && (
          <Button
            type='primary'
            size='large'
            icon={addNewIcon}
            onClick={() => history.push(`${pathname}/create`)}>
            Add New {dataAbout.charAt(0).toUpperCase() + dataAbout.slice(1)}
          </Button>
        )}
      </div>
      {defaultColumns && (
        <Table
          rowKey='id'
          rowSelection
          rowClassName='data-overview-row'
          columns={defaultColumns || columns}
          loading={selectedInfo.loading}
          dataSource={selectedInfo.data}
          locale={{
            emptyText: selectedInfo.loading ? (
              <p style={{ fontSize: '1.2rem' }}>Loading {dataAbout}s data...</p>
            ) : (
              <Empty
                image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
                imageStyle={{ height: 150 }}
                description={
                  <h3 style={{ color: 'gray', fontSize: '1.2rem' }}>
                    {errMsg ||
                      'No items were found matching this combination of selected filters.'}
                  </h3>
                }
              />
            ),
          }}
          pagination={{
            total: selectedInfo.totalData,
            showTotal: (total, range) =>
              `${range[0]} - ${range[1]} of ${total}`,
            current: selectedInfo.curPage,
            pageSize: selectedInfo.pageSize,
            defaultPageSize: 8,
            showTitle: true,
            showSizeChanger: true,
            hideOnSinglePage: true,
            pageSizeOptions: [8, 16, 24, 32],
          }}
          scroll={{
            scrollToFirstRowOnChange: true,
          }}
          onRow={({ id }) => {
            return {
              onClick: () => history.push(`${pathname}/${id}`),
            }
          }}
          onChange={({ current, pageSize }, filters, sorters) => {
            const queryParams = {
              ...parse(search, { ignoreQueryPrefix: true }),
            }

            if (current > 1) {
              queryParams.page = current
            } else {
              delete queryParams.page
            }

            if (pageSize !== 8) {
              queryParams.pageSize = pageSize
            } else {
              delete queryParams.pageSize
            }

            if (Object.keys(filters).length > 0) {
              Object.entries(filters).forEach(([key, value]) => {
                if (value !== null) {
                  if (key === 'isAdmin') {
                    // eslint-disable-next-line prefer-destructuring
                    queryParams[key] = value[0]
                  } else {
                    queryParams[key] = value
                  }
                } else {
                  delete queryParams[key]
                }
              })
            }

            if (
              Object.keys(sorters).length > 0 &&
              sorters.column !== undefined
            ) {
              queryParams.sortBy = {
                [sorters.field]: sorters.order,
              }
            } else {
              delete queryParams.sortBy
            }

            history.push({
              search: stringify(queryParams, {
                encode: false,
                addQueryPrefix: true,
                arrayFormat: 'brackets',
              }),
            })
          }}
        />
      )}
    </div>
  )
}

DataOverviewPage.defaultProps = {
  addNew: true,
  addNewIcon: undefined,
}

DataOverviewPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
  title: PropTypes.node.isRequired,
  addNew: PropTypes.bool,
  addNewIcon: PropTypes.node,
  dataAbout: PropTypes.string.isRequired,
  columns: PropTypes.oneOfType([PropTypes.arrayOf(Object), PropTypes.func])
    .isRequired,
  action: PropTypes.func.isRequired,
  selector: PropTypes.func.isRequired,
}

export default DataOverviewPage
