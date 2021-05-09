import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Switch, Route } from 'react-router-dom'
import { BackTop } from 'antd'

import SigninPage from '@pages/SigninPage/index'
import SignupPage from '@pages/SignupPage/index'
import ForgotPasswordPage from '@pages/ForgotPasswordPage/index'
import ResetPasswordPage from '@pages/ResetPasswordPage/index'

import Navbar from '@components/Navbar/index'
import ProtectedRoute from '@components/ProtectedRoute/index'

import { authUser } from '@redux/user/userSlice'

import './App.less'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const response = await dispatch(authUser())
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    }

    getAuthUser()
  }, [dispatch])

  return (
    <>
      <div className='App-header'>
        <Navbar />
      </div>
      <div className='App'>
        <Switch>
          <Route exact path='/'>
            <div>
              <h1>G-Shock-Watches</h1>
            </div>
          </Route>
          <ProtectedRoute
            exact
            path='/auth/signin'
            to='/'
            component={SigninPage}
          />
          <ProtectedRoute
            exact
            path='/auth/signup'
            to='/'
            component={SignupPage}
          />
          <ProtectedRoute
            exact
            path='/auth/forgotpassword'
            to='/'
            component={ForgotPasswordPage}
          />
          <ProtectedRoute
            exact
            path='/auth/resetpassword/:resetToken'
            to='/'
            component={ResetPasswordPage}
          />
        </Switch>
        <BackTop />
      </div>
    </>
  )
}

export default App
