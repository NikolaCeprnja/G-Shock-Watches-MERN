import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { unwrapResult } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Button, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Formik, Field } from 'formik'
import { Form, SubmitButton } from 'formik-antd'
import * as Yup from 'yup'

import InputField from '@components/InputField/index'
import { ReactComponent as GoogleIcon } from '@assets/Google_logo.svg'

import { selectUser, signin } from '@redux/user/userSlice'
import { create as createNotification } from '@redux/notification/notificationSlice'

import './styles.scss'

const SigninPage = ({ location }) => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectUser)
  const [validateOnBlur, setValidateOnBlur] = useState(true)
  const [serverResponse, setServerResponse] = useState({})
  const [errMsg, setErrMsg] = useState('')
  const [nonExistingUsers, setNonExistingUsers] = useState([])

  return (
    <div className='Signin'>
      {Object.keys(serverResponse).length > 0 && (
        <Alert
          type={serverResponse.status >= 400 ? 'error' : 'success'}
          message={
            <b>
              {serverResponse.status >= 400
                ? serverResponse.statusText
                : 'Success'}
            </b>
          }
          description={
            serverResponse.status >= 400 ? (
              serverResponse.message ||
              'Something went wrong, please try again later.'
            ) : (
              <p>
                {serverResponse.message}
                <br />
                {JSON.stringify(loggedInUser, null, 2)}
              </p>
            )
          }
          closable
          showIcon
          style={{ width: 400, marginBottom: '1.5rem', textAlign: 'left' }}
        />
      )}
      <Card title='Sign In'>
        <Formik
          initialValues={{ userNameOrEmail: '', password: '' }}
          onSubmit={async (values, { setFieldError }) => {
            setValidateOnBlur(true)
            setServerResponse({})
            try {
              const response = await dispatch(signin(values))

              const { message } = unwrapResult(response)
              dispatch(
                createNotification({
                  id: 'signedin',
                  type: 'success',
                  title: 'You are successfully logged in!',
                  description: message,
                })
              )
            } catch (error) {
              console.log(error)
              const {
                status,
                statusText,
                data: { errors, message },
              } = error

              if (errors) {
                setValidateOnBlur(false)
                Object.keys(errors).forEach(err => {
                  setFieldError(err, errors[err].message)
                  if (err === 'userNameOrEmail') {
                    setNonExistingUsers([
                      ...nonExistingUsers,
                      errors[err].value,
                    ])
                    setErrMsg(errors[err].message)
                  }
                })
              } else {
                setServerResponse({
                  status,
                  statusText,
                  message,
                })
              }
            }
          }}
          validationSchema={Yup.object().shape({
            userNameOrEmail: Yup.string()
              .trim()
              .min(6, 'Must be at least 6 characters long.')
              .max(30, 'Maximum 30 characters long.')
              .required('Please input your username or email.')
              .notOneOf(nonExistingUsers, errMsg),
            password: Yup.string()
              .min(6, 'Must be at least 6 characters long.')
              .required('Please input your password.'),
          })}
          validateOnBlur={validateOnBlur}>
          {({ dirty, isValid }) => (
            <Form layout='vertical' size='large'>
              <Field
                name='userNameOrEmail'
                prefix={<UserOutlined className='site-form-item-icon' />}
                placeholder='Username or Email address'
                component={InputField}
              />
              <Field
                name='password'
                type='password'
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Password'
                component={InputField}
              />
              <Form.Item name='forgotPassword'>
                <Link to='/auth/forgot-password' style={{ float: 'right' }}>
                  Forgot password?
                </Link>
              </Form.Item>
              <Form.Item name='signin'>
                <SubmitButton block disabled={!dirty || !isValid}>
                  Sign in
                </SubmitButton>
              </Form.Item>
              <Form.Item name='signinWithGoogle'>
                <Button
                  id='google-signin-btn'
                  block
                  type='dashed'
                  htmlType='button'
                  icon={<GoogleIcon id='google-icon' />}
                  onClick={() => {
                    window.location = `http://localhost:5000/api/users/auth/google${
                      location.state
                        ? `?redirect_to=${location.state.from.pathname}`
                        : ''
                    }`
                  }}>
                  Sign in with Google
                </Button>
              </Form.Item>
              <Form.Item name='register' noStyle>
                <span className='signup-caption'>
                  New to G-Shock-Watches?
                  <br /> Go <Link to='/auth/signup'>Register now!</Link>
                </span>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}

SigninPage.propTypes = {
  location: PropTypes.instanceOf(Object).isRequired,
}

export default SigninPage
