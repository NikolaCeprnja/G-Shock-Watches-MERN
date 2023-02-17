import React from 'react'
import PropTypes from 'prop-types'

import './styles.scss'

const AreaChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const [{ payload: data }] = payload

    return (
      <div className='area-chart-tooltip'>
        <p className='label'>{label}</p>
        <ul>
          <li className='total-amount'>
            Total income: $<span>{data.total.amount.toFixed(2)}</span>{' '}
          </li>
          <li className='paid-orders'>
            Total paid orders: {data.total.paidOrders}
          </li>
        </ul>
      </div>
    )
  }

  return null
}

AreaChartTooltip.defaultProps = {
  label: '',
}

AreaChartTooltip.propTypes = {
  active: PropTypes.bool.isRequired,
  payload: PropTypes.arrayOf(Object).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default AreaChartTooltip
