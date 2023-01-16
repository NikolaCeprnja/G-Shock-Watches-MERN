import React, { useEffect, Suspense, lazy } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route } from 'react-router-dom'
import { Spin, BackTop, notification as antdNotifications } from 'antd'

import AuthLayout from '@layouts/AuthLayout/index'
import MainLayout from '@layouts/MainLayout/index'

import Notification from '@components/Notification/index'

import ProtectedRoute from '@components/ProtectedRoute/index'

import { authUser } from '@redux/user/userThunk'
import { selectLoggedInUser } from '@redux/user/userSlice'
import { selectNotifications } from '@redux/notification/notificationSlice'

import './App.less'

const HomePage = lazy(() => import('@pages/HomePage'))
const SigninPage = lazy(() => import('@pages/SigninPage/index'))
const SignupPage = lazy(() => import('@pages/SignupPage/index'))
const ForgotPasswordPage = lazy(() => import('@pages/ForgotPasswordPage/index'))
const ResetPasswordPage = lazy(() => import('@pages/ResetPasswordPage/index'))
const WatchesPage = lazy(() => import('@pages/WatchesPage/index'))
const CheckoutPage = lazy(() => import('@pages/CheckoutPage/index'))

const App = () => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)
  const notifications = useSelector(selectNotifications)

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        await dispatch(authUser())
      } catch (err) {
        console.log(err)
      }
    }

    getAuthUser()
  }, [dispatch])

  useEffect(() => {
    if (!loggedInUser.info && loggedInUser.auth === 'unauthenticated') {
      antdNotifications.destroy()
    }
  }, [loggedInUser])

  return (
    <>
      <Suspense fallback={<Spin size='large' />}>
        <Switch>
          <Route
            exact
            path='/'
            render={() => (
              <MainLayout>
                <HomePage />
              </MainLayout>
            )}
          />
          <ProtectedRoute
            exact
            path='/auth/signin'
            to='/'
            layout={AuthLayout}
            component={SigninPage}
          />
          <ProtectedRoute
            exact
            path='/auth/signup'
            to='/'
            layout={AuthLayout}
            component={SignupPage}
          />
          <ProtectedRoute
            exact
            path='/auth/forgot-password'
            to='/'
            layout={AuthLayout}
            component={ForgotPasswordPage}
          />
          <ProtectedRoute
            exact
            path='/auth/reset-password/:resetToken'
            to='/'
            layout={AuthLayout}
            component={ResetPasswordPage}
          />
          <Route
            exact
            path={['/watches/:type?', '/watches/:gender?/:name/:pid']}
            render={() => (
              <MainLayout>
                <WatchesPage />
              </MainLayout>
            )}
          />
          <Route
            exact
            path='/checkout/:currentStep?'
            render={() => (
              <MainLayout>
                <CheckoutPage />
              </MainLayout>
            )}
          />
          {/* // TODO: add 403, 404 and 500 pages */}
          <Route path='*' render={() => <div>Error, 404 Page!</div>} />
        </Switch>
        <BackTop />
      </Suspense>
      {notifications.data?.map(notification => (
        <Notification key={notification.id} {...notification} />
      ))}
    </>
  )
}

export default App
