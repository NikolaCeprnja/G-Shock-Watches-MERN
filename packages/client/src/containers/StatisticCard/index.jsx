import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useErrorBoundary } from 'react-error-boundary'

import ErrorHandler from '@utils/ErrorHandler'

const StatisticCard = ({ request, children, periodFor, wrapperClassName }) => {
  const [data, setData] = useState()
  const [queryParams, setQueryParams] = useState({ period: periodFor })
  const [loading, setLoading] = useState(false)
  const { showBoundary } = useErrorBoundary()

  useEffect(() => {
    const source = axios.CancelToken.source()

    const fetchData = async () => {
      try {
        setLoading(true)
        const {
          data: { message, ...value },
        } = await request(source.token, queryParams)
        setData(value)
        setLoading(false)
      } catch (err) {
        if (!axios.isCancel(err) && !err.isAxiosError) {
          const {
            status,
            statusText,
            data: { error, message },
          } = err.response

          setLoading(false)

          const boundaryError = new ErrorHandler(message, status, statusText, {
            cause: error,
          })

          showBoundary(boundaryError)
        }
      }
    }

    fetchData()

    return () => {
      source.cancel('Request Aborted due to component unmount.')
    }
  }, [request, queryParams, showBoundary])

  return (
    <div className={wrapperClassName}>
      {children({ data, loading, setQueryParams })}
    </div>
  )
}

StatisticCard.defaultProps = {
  periodFor: 'today',
  wrapperClassName: '',
}

StatisticCard.propTypes = {
  request: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  periodFor: PropTypes.string,
  wrapperClassName: PropTypes.string,
}

export default StatisticCard
