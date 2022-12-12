import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { Spin } from 'antd'

import { selectLoggedInUser } from '@redux/user/userSlice'

const ProtectedRoute = ({
  to,
  isPrivate,
  component: Component,
  layout: Layout,
  siderMenu,
  ...rest
}) => {
  const loggedInUser = useSelector(selectLoggedInUser)
  const [isBusy, setIsBusy] = useState(true)

  useEffect(() => {
    if (
      (loggedInUser.info && loggedInUser.auth === 'authenticated') ||
      loggedInUser.auth === 'unauthenticated'
    ) {
      setIsBusy(false)
    }
  }, [loggedInUser])

  return (
    <Route
      {...rest}
      render={({ ...routeProps }) => {
        const { location } = routeProps

        if (isBusy || loggedInUser.auth === 'authenticating') {
          return <Spin size='large' />
        }

        if (
          (loggedInUser.info && isPrivate) ||
          (!loggedInUser.info && !isPrivate)
        ) {
          if (Layout) {
            return (
              <Layout siderMenu={siderMenu}>
                <Component {...rest} {...routeProps} />
              </Layout>
            )
          }

          return <Component {...rest} {...routeProps} />
        }

        if (loggedInUser.info) {
          // eslint-disable-next-line no-nested-ternary
          const redirectTo = loggedInUser.signedIn
            ? loggedInUser.info.isAdmin
              ? '/admin/dashboard'
              : to
            : `/users/${loggedInUser.info.id}/profile`

          return <Redirect to={location.state?.from ?? redirectTo} />
        }

        return <Redirect to={{ pathname: to, state: { from: location } }} />
      }}
    />
  )
}

ProtectedRoute.defaultProps = {
  to: '/auth/signin',
  isPrivate: false,
  siderMenu: undefined,
  layout: undefined,
}

ProtectedRoute.propTypes = {
  to: PropTypes.string,
  isPrivate: PropTypes.bool,
  component: PropTypes.instanceOf(Object).isRequired,
  layout: PropTypes.func,
  siderMenu: PropTypes.func,
}

export default ProtectedRoute
