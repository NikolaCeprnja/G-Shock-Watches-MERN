import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

import { selectUser } from '@redux/user/userSlice'

const ProtectedRoute = ({
  to,
  isPrivate,
  component: Component,
  layout: Layout,
  ...rest
}) => {
  const loggedInUser = useSelector(selectUser)
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
          return !isPrivate ? null : <Layout>{null}</Layout>
        }

        if (
          (loggedInUser.info && isPrivate) ||
          (!loggedInUser.info && !isPrivate)
        ) {
          return (
            <Layout>
              <Component {...routeProps} />
            </Layout>
          )
        }

        if (loggedInUser.info) {
          const redirectTo = loggedInUser.signedIn
            ? to
            : `/users/${loggedInUser.info.id}/profile/settings`

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
}

ProtectedRoute.propTypes = {
  to: PropTypes.string,
  isPrivate: PropTypes.bool,
  component: PropTypes.instanceOf(Object).isRequired,
  layout: PropTypes.func.isRequired,
}

export default ProtectedRoute
