import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { unwrapResult } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Alert, message as infoMessage } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Formik, Field } from 'formik'
import { Form, SubmitButton } from 'formik-antd'
import * as Yup from 'yup'

import InputField from '@components/InputField/index'
import AvatarUpload from '@components/AvatarUpload/index'

import { selectUser, signup } from '@redux/user/userSlice'
import { create as createNotification } from '@redux/notification/notificationSlice'

import './styles.scss'

const SignupPage = () => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectUser)

  const InfoMessage = () => {
    infoMessage.loading({
      key: 'info',
      duration: 0,
      content: 'Creating your account...',
    })
  }
  const [serverResponse, setServerResponse] = useState({})
  const [existingEmails, setExistingEmails] = useState([])
  const [existingUserNames, setExistingUserNames] = useState([])

  useEffect(() => {
    if (!loggedInUser.loading) {
      infoMessage.destroy('info')
    } else if (loggedInUser.loading) {
      InfoMessage()
    }

    return () => {
      infoMessage.destroy('info')
    }
  }, [loggedInUser, dispatch])

  return (
    <div className='Signup'>
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
      <Card title='Sign Up'>
        <Formik
          initialValues={{
            avatar: undefined,
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          onSubmit={async (values, { setFieldError }) => {
            setServerResponse({})
            try {
              const data = new FormData()
              Object.keys(values).forEach(key => data.append(key, values[key]))

              const response = await dispatch(signup(data))
              console.log(response)
              const { message } = unwrapResult(response)

              dispatch(
                createNotification({
                  id: 'signedup',
                  type: 'success',
                  title: 'Your account is successfully created!',
                  description: message,
                })
              )
            } catch (error) {
              console.log(error)
              const { errors, message } = error.data
              const { status, statusText } = error

              if (errors) {
                Object.keys(errors).forEach(err => {
                  if (err === 'userName') {
                    setExistingUserNames([
                      ...existingUserNames,
                      errors[err].value,
                    ])
                  }
                  if (err === 'email') {
                    setExistingEmails([...existingEmails, errors[err].value])
                  }
                  setFieldError(err, errors[err].message)
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
            avatar: Yup.mixed()
              .notRequired()
              .test(
                'FILE_TYPE',
                'Unsuported file selected.\nOnly .PNG or .JPEG (JPG) files are allowed.',
                value => {
                  if (value) {
                    return (
                      value.type === 'image/png' || value.type === 'image/jpeg'
                    )
                  }

                  return true
                }
              )
              .test(
                'FILE_SIZE',
                'Chosen file needs to be less then 1MB.',
                value => {
                  if (value) {
                    return value.size <= 1000000
                  }

                  return true
                }
              ),
            userName: Yup.string()
              .trim()
              .min(6, 'Must be at least 6 characters long.')
              .max(30, 'Maximum 30 characters long.')
              .required('Please input your username.')
              .notOneOf(
                existingUserNames,
                'Username already taken, please try another one.'
              ),
            email: Yup.string()
              .trim()
              .email('Invalid email.')
              .required('Please input your email address.')
              .notOneOf(
                existingEmails,
                'Email already taken, please try another one.'
              ),
            // TODO: add regex for password
            password: Yup.string()
              .min(6, 'Must be at least 6 characters long.')
              .required('Please input your password.'),
            confirmPassword: Yup.string()
              .min(6, 'Must be at least 6 characters long.')
              .oneOf([Yup.ref('password')], 'Password needs to be the same.')
              .required('Please confirm your password'),
          })}>
          {({ dirty, isValid }) => (
            <Form layout='vertical' size='large'>
              <Field name='avatar' component={AvatarUpload} />
              <Field
                name='userName'
                prefix={<UserOutlined className='site-form-item-icon' />}
                placeholder='Username'
                component={InputField}
              />
              <Field
                name='email'
                type='email'
                prefix={<MailOutlined className='site-form-item-icon' />}
                placeholder='Email address'
                component={InputField}
              />
              <Field
                name='password'
                type='password'
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Password'
                component={InputField}
              />
              <Field
                name='confirmPassword'
                type='password'
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Confirm password'
                component={InputField}
              />
              <Form.Item name='signup'>
                <SubmitButton block disabled={!dirty || !isValid}>
                  Sign up
                </SubmitButton>
              </Form.Item>
              <Form.Item name='signin' noStyle>
                <span className='signin-caption'>
                  Already have an account?
                  <br /> Go <Link to='/auth/signin'>Sign In now!</Link>
                </span>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}

export default SignupPage
