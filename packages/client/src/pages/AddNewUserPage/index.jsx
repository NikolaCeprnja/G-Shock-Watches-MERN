import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Formik, Field } from 'formik'
import { Form, FormItem, SubmitButton } from 'formik-antd'
import { Row, Col, Button, Checkbox, Tabs } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'

import RouterPrompt from '@components/RouterPrompt/index'
import AvatarUpload from '@components/AvatarUpload/index'
import InputField from '@components/InputField/index'

import { signup as createNewUser } from '@api/user/auth'
import { signupValidationSchema } from '@validation/user-validation'
import { create as createNotification } from '@redux/notification/notificationSlice'

import './styles.scss'

const { TabPane } = Tabs

const AddNewUserPage = ({ history }) => {
  const dispatch = useDispatch()
  const [existingUserNames, setExistingUserNames] = useState([])
  const [existingEmails, setExistingEmails] = useState([])

  const handleSubmit = useCallback(
    async (values, { resetForm, setFieldError }) => {
      const data = new FormData()

      Object.entries(values).forEach(([key, value]) => {
        data.append(key, value)
      })

      try {
        const {
          data: { message },
        } = await createNewUser(data, '/createNewUser')

        dispatch(
          createNotification({
            id: 'newUserCreatedSuccess',
            type: 'success',
            title: 'Success!',
            description: message,
          })
        )

        resetForm()
      } catch (error) {
        const {
          statusText,
          data: { errors, message },
        } = error.response

        dispatch(
          createNotification({
            id: 'newUserCreatedError',
            type: 'error',
            title: `Error, ${statusText}`,
            description:
              message ||
              'Something went wrong while creating a user account, please try again later.',
          })
        )

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
        }
      }
    },
    [dispatch]
  )

  return (
    <div className='AddNewUserPageWrapper'>
      <Formik
        initialValues={{
          avatar: null,
          userName: '',
          email: '',
          isAdmin: false,
          password: '',
          confirmPassword: '',
        }}
        onSubmit={handleSubmit}
        validationSchema={signupValidationSchema(
          existingUserNames,
          existingEmails,
          true
        )}>
        {({
          dirty,
          isValid,
          setFieldValue,
          handleSubmit: submitForm,
          values: { userName, email, isAdmin },
        }) => (
          <>
            <RouterPrompt when={dirty} />
            <div className='AddNewUserPage'>
              <div className='caption-background' />
              <div className='caption'>
                <div className='user-preview-wrapper'>
                  <Button
                    type='link'
                    style={{ padding: 0 }}
                    className='user-back-arrow'
                    icon={<ArrowLeftOutlined />}
                    onClick={() => history.push('/admin/users')}>
                    Users
                  </Button>
                  <div className='new-user-preview'>
                    <Form name='user-avatar' layout='vertical'>
                      <Field name='avatar' component={AvatarUpload} />
                    </Form>
                    <div className='user-name-wrapper'>
                      <h1 className='user-name'>{userName || 'New User'}</h1>
                      <h2 className='user-email'>
                        {email || 'newuser@example.com'}
                      </h2>
                      <p>User Details</p>
                    </div>
                  </div>
                </div>
                <div className='form-actions'>
                  <SubmitButton
                    size='large'
                    icon={<SaveOutlined />}
                    disabled={!dirty || !isValid}
                    onClick={() => submitForm()}>
                    Save
                  </SubmitButton>
                </div>
              </div>
              <Tabs>
                <TabPane tab='Basic User Info'>
                  <Form layout='vertical'>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Field
                          required
                          size='large'
                          name='userName'
                          label='User Name'
                          component={InputField}
                        />
                      </Col>
                      <Col span={8}>
                        <Field
                          required
                          size='large'
                          name='email'
                          type='email'
                          label='Email'
                          component={InputField}
                        />
                      </Col>
                      <Col span={8}>
                        <FormItem name='isAdmin' label='IsAdmin'>
                          <Checkbox
                            name='isAdmin'
                            checked={isAdmin}
                            defaultChecked={isAdmin}
                            onChange={e => {
                              setFieldValue('isAdmin', e.target.checked)
                            }}
                          />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Field
                          required
                          size='large'
                          name='password'
                          type='password'
                          label='Password'
                          component={InputField}
                        />
                      </Col>
                      <Col span={8}>
                        <Field
                          required
                          size='large'
                          name='confirmPassword'
                          type='password'
                          label='Confirm Password'
                          component={InputField}
                        />
                      </Col>
                    </Row>
                  </Form>
                </TabPane>
              </Tabs>
            </div>
          </>
        )}
      </Formik>
    </div>
  )
}

AddNewUserPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
}

export default AddNewUserPage
