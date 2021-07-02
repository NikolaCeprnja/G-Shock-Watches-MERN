import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Alert } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { Formik, Field } from 'formik'
import { Form, SubmitButton } from 'formik-antd'
import * as Yup from 'yup'

import InputField from '@components/InputField/index'

import { resetPassword } from '@api/user/auth'

import './styles.scss'

const ResetPasswordPage = () => {
  const { resetToken } = useParams()
  const [serverResponse, setServerResponse] = useState({})

  return (
    <>
      <div className='Resetpassword'>
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
        <Card title='Reset Password'>
          <Formik
            initialValues={{ newPassword: '', confirmNewPassword: '' }}
            onSubmit={async (values, { setFieldError, resetForm }) => {
              setServerResponse({})
              try {
                const response = await resetPassword(values, resetToken)
                const {
                  status,
                  data: { message },
                } = response

                setServerResponse({ status, message })
                resetForm()
              } catch ({ response }) {
                console.log(response)
                const {
                  status,
                  statusText,
                  data: { errors, message },
                } = response

                if (errors) {
                  Object.keys(errors).forEach(err =>
                    setFieldError(err, errors[err].message)
                  )
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
              newPassword: Yup.string()
                .min(6, 'Must be at least 6 characters long.')
                .required('Please input your new password.'),
              confirmNewPassword: Yup.string()
                .min(6, 'Must be at least 6 characters long.')
                .oneOf(
                  [Yup.ref('newPassword')],
                  'Password needs to be the same.'
                )
                .required('Please confirm your new password'),
            })}>
            {({ dirty, isValid }) => (
              <Form layout='vertical' size='large'>
                <Field
                  name='newPassword'
                  type='password'
                  prefix={<LockOutlined className='site-form-item-icon' />}
                  placeholder='New password'
                  component={InputField}
                />
                <Field
                  name='confirmNewPassword'
                  type='password'
                  prefix={<LockOutlined className='site-form-item-icon' />}
                  placeholder='Confirm new password'
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

export default ResetPasswordPage
