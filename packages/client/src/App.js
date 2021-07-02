import React, { useEffect, Suspense, lazy } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route } from 'react-router-dom'
import { Spin, BackTop } from 'antd'

import AuthLayout from '@layouts/AuthLayout/index'
import MainLayout from '@layouts/MainLayout/index'

import Notification from '@components/Notification/index'

import ProtectedRoute from '@components/ProtectedRoute/index'

import { authUser } from '@redux/user/userSlice'
import { selectNotifications } from '@redux/notification/notificationSlice'

import './App.less'

const HomePage = lazy(() => import('@pages/HomePage'))
const SigninPage = lazy(() => import('@pages/SigninPage/index'))
const SignupPage = lazy(() => import('@pages/SignupPage/index'))
const ForgotPasswordPage = lazy(() => import('@pages/ForgotPasswordPage/index'))
const ResetPasswordPage = lazy(() => import('@pages/ResetPasswordPage/index'))
/* const ReviewsPage = lazy(() => import('@pages/ReviewsPage/index'))
const WatchesPage = lazy(() => import('@pages/WatchesPage/index')) */

function App() {
  const dispatch = useDispatch()
  const notifications = useSelector(selectNotifications)

  useEffect(() => {
    const getAuthUser = () => dispatch(authUser())

    getAuthUser()
  }, [dispatch])

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
            component={SigninPage}
            layout={AuthLayout}
          />
          <ProtectedRoute
            exact
            path='/auth/signup'
            to='/'
            component={SignupPage}
            layout={AuthLayout}
          />
          <ProtectedRoute
            exact
            path='/auth/forgot-password'
            to='/'
            component={ForgotPasswordPage}
            layout={AuthLayout}
          />
          <ProtectedRoute
            exact
            path='/auth/reset-password/:resetToken'
            to='/'
            component={ResetPasswordPage}
            layout={AuthLayout}
          />
          {/* <ProtectedRoute
            exact
            path='/users/:uid/reviews'
            isPrivate
            component={ReviewsPage}
            layout={MainLayout}
          />
          <Route
            exact
            path='/watches/:type'
            render={() => (
              <MainLayout>
                <WatchesPage />
              </MainLayout>
            )}
          /> */}
        </Switch>
        {notifications.data?.map(notification => (
          <Notification key={notification.id} {...notification} />
        ))}
        <BackTop />
      </Suspense>
    </>
  )
}

export default App
