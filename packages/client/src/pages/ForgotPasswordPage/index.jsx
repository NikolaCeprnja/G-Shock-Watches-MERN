import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, Alert } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Formik, Field } from 'formik'
import { Form, SubmitButton } from 'formik-antd'

import InputField from '@components/InputField/index'

import { forgotPassword } from '@api/user/auth'
import { forgotPassValidationSchema } from '@validation/user-validation'

import './styles.scss'

const ForgotPasswordPage = () => {
  const [errMsg, setErrMsg] = useState('')
  const [nonExistingUsers, setNonExistingUsers] = useState([])
  const [serverResponse, setServerResponse] = useState({})

  const handleSubmit = useCallback(
    async (values, { setFieldError, resetForm }) => {
      setServerResponse({})
      try {
        const response = await forgotPassword(values)
        const {
          status,
          data: { message },
        } = response

        setServerResponse({ status, message })
        resetForm()
      } catch ({ response }) {
        const {
          status,
          statusText,
          data: { errors, message },
        } = response

        if (errors) {
          Object.keys(errors).forEach(err => {
            setFieldError(err, errors[err].message)
            if (err === 'userNameOrEmail') {
              setErrMsg(errors[err].message)
              setNonExistingUsers(users => [...users, errors[err].value])
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
    },
    []
  )

  return (
    <>
      <div className='ForgotpasswordPage'>
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
              serverResponse.message ||
              'Something went wrong, please try again later.'
            }
            closable
            showIcon
            style={{ width: 400, marginBottom: '1.5rem', textAlign: 'left' }}
          />
        )}
        <Card title='Forgot Password'>
          <Formik
            initialValues={{ userNameOrEmail: '' }}
            onSubmit={handleSubmit}
            validationSchema={forgotPassValidationSchema(
              nonExistingUsers,
              errMsg
            )}>
            {({ dirty, isValid }) => (
              <Form layout='vertical' size='large'>
                <Field
                  name='userNameOrEmail'
                  prefix={<UserOutlined className='site-form-item-icon' />}
                  placeholder='Username or Email address'
                  component={InputField}
                />
                <Form.Item name='forgotPassword'>
                  <SubmitButton block disabled={!dirty || !isValid}>
                    Send request
                  </SubmitButton>
                </Form.Item>
                <Form.Item name='signin' noStyle>
                  <span className='signin-caption'>
                    Go back to <Link to='/auth/signin'>Sign In</Link>
                  </span>
                </Form.Item>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </>
  )
}

export default ForgotPasswordPage
