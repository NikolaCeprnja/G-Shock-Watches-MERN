import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const StatisticCard = ({ request, children, periodFor, wrapperClassName }) => {
  const [data, setData] = useState()
  const [queryParams, setQueryParams] = useState({ period: periodFor })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const {
          data: { message, ...value },
        } = await request(queryParams)
        setData(value)
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }

    fetchData()
  }, [request, queryParams])

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
