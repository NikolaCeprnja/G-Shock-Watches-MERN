import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Alert, message as infoMessage } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Formik, Field } from 'formik'
import { Form, SubmitButton } from 'formik-antd'

import InputField from '@components/InputField/index'
import AvatarUpload from '@components/AvatarUpload/index'

import { signup } from '@redux/user/userThunk'
import { selectLoggedInUser } from '@redux/user/userSlice'
import { create as createNotification } from '@redux/notification/notificationSlice'
import { signupValidationSchema } from '@validation/user-validation'

import './styles.scss'

const InfoMessage = () => {
  infoMessage.loading({
    key: 'info',
    duration: 0,
    content: 'Creating your account...',
  })
}

const SignupPage = () => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)

  const [serverResponse, setServerResponse] = useState({})
  const [existingEmails, setExistingEmails] = useState([])
  const [existingUserNames, setExistingUserNames] = useState([])

  const handleSubmit = useCallback(
    async (values, { setFieldError }) => {
      setServerResponse({})
      try {
        const data = new FormData()
        Object.keys(values).forEach(key => data.append(key, values[key]))

        const { message } = await dispatch(signup(data)).unwrap()

        dispatch(
          createNotification({
            id: 'signedup',
            type: 'success',
            title: 'Your account is successfully created!',
            description: message,
          })
        )
      } catch (error) {
        const { errors, message } = error.data
        const { status, statusText } = error

        if (errors) {
          Object.keys(errors).forEach(err => {
            if (err === 'userName') {
              setExistingUserNames(userNames => [
                ...userNames,
                errors[err].value,
              ])
            }
            if (err === 'email') {
              setExistingEmails(emails => [...emails, errors[err].value])
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
    },
    [dispatch]
  )

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
    <div className='SignupPage'>
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
            avatar: null,
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          onSubmit={handleSubmit}
          validationSchema={signupValidationSchema(
            existingUserNames,
            existingEmails
          )}>
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
