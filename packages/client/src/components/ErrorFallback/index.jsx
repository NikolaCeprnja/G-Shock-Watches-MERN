import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'

import { Result } from 'antd'

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { pathname } = useLocation()
  const currPath = useRef(pathname)

  if (pathname !== currPath.current) {
    resetErrorBoundary()
    currPath.current = pathname
  }

  return (
    <Result
      style={{ margin: 'auto' }}
      status={[403, 404, 500].find(
        statusCode => statusCode === error.status || error.status < statusCode
      )}
      title={
        <>
          <strong>{error.status}</strong>
          <p>{error.statusText}</p>
        </>
      }
      subTitle={error.message || 'Something went wrong, please try again later'}
      extra={
        <Link to={error.redirect.to} onClick={() => resetErrorBoundary()}>
          {error.redirect.text}
        </Link>
      }
    />
  )
}

ErrorFallback.defaultProps = {
  error: {
    status: 500,
    statusText: 'Internal Server Error',
    message: 'Something went wrong, please try again later.',
    redirect: {
      to: '/',
      text: 'Back to Home',
    },
  },
}

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    status: PropTypes.number,
    statusText: PropTypes.string,
    message: PropTypes.string,
    redirect: PropTypes.shape({
      to: PropTypes.string,
      text: PropTypes.string,
    }),
  }),
  resetErrorBoundary: PropTypes.func.isRequired,
}

export default ErrorFallback
