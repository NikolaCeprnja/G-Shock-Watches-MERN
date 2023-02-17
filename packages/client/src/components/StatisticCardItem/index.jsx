import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Card, Statistic } from 'antd'

import './styles.scss'

const StatisticCardItem = ({
  loading,
  about,
  title,
  value,
  valueStyle,
  redirectTo,
  icon: Icon,
}) => {
  return (
    <div>
      <Card className='statistic-card'>
        <Statistic
          loading={loading}
          title={<span className='statistic-title'>{title}</span>}
          value={value}
          valueStyle={valueStyle}
        />
        <div className='statistic-info'>
          <Link className='preview-more' to={redirectTo}>
            {`See all ${about}s`}
          </Link>
          <Icon
            style={{
              fontSize: '1.5rem',
            }}
          />
        </div>
      </Card>
    </div>
  )
}

StatisticCardItem.defaultProps = {
  loading: false,
  value: 0,
  valueStyle: { fontSize: '2rem', fontWeight: 500 },
}

StatisticCardItem.propTypes = {
  loading: PropTypes.bool,
  about: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  valueStyle: PropTypes.instanceOf(Object),
  redirectTo: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
}

export default StatisticCardItem
