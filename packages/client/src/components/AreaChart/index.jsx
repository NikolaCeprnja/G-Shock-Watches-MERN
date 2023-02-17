import React from 'react'
import PropTypes from 'prop-types'
import {
  ResponsiveContainer,
  AreaChart as Chart,
  CartesianGrid,
  XAxis,
  Tooltip,
  Area,
} from 'recharts'

import AreaChartTooltip from '@components/AreaChartTooltip/index'

import './styles.scss'

const AreaChart = ({ data, dataKey }) => {
  return (
    <div className='areachart-wrapper'>
      <ResponsiveContainer width='100%' height='100%'>
        <Chart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 3,
            bottom: 0,
          }}>
          <defs>
            <linearGradient id='colorUv' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='label' />
          <Tooltip content={AreaChartTooltip} />
          <Area
            type='monotone'
            dataKey={dataKey}
            stroke='#8884d8'
            fill='url(#colorUv)'
            fillOpacity={0.7}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}

AreaChart.defaultProps = {
  data: [],
}

AreaChart.propTypes = {
  data: PropTypes.arrayOf(Object),
  dataKey: PropTypes.string.isRequired,
}

export default AreaChart
