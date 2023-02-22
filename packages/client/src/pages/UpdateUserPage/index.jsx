/* eslint-disable no-unused-vars */
import React, {
  lazy,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  Suspense,
} from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Row,
  Col,
  Tabs,
  Button,
  Checkbox,
  Spin,
  message as updatingMessage,
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UndoOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { Formik, Field } from 'formik'
import { Form, FormItem, SubmitButton, ResetButton } from 'formik-antd'

import AvatarUpload from '@components/AvatarUpload/index'
import RouterPrompt from '@components/RouterPrompt/index'
import InputField from '@components/InputField/index'
import DeleteConfirmPrompt from '@components/DeleteConfirmPrompt/index'

import { getUserById, updateUser } from '@redux/user/userThunk'
import { clearUserPreview, selectUserPreview } from '@redux/user/userSlice'
import { create as createNotification } from '@redux/notification/notificationSlice'

import { deleteUser } from '@api/user/index'
import { updateUserValidationSchema } from '@validation/user-validation'

import './styles.scss'

const PurchasedProductsPage = lazy(() =>
  import('@pages/PurchasedProductsPage/index')
)
const UserOrdersPage = lazy(() => import('@pages/UserOrdersPage/index'))

const { TabPane } = Tabs
const UpdatingMessage = () => {
  updatingMessage.loading({
    key: 'updatingUserAcc',
    duration: 0,
    content: 'Updating the user account...',
  })
}

const UpdateUserPage = ({ history }) => {
  const { uid } = useParams()
  const [activeTabKey, setActiveTabKey] = useState()
  const [defaultFileList, setDefaultFileList] = useState([])
  const [shouldFormReset, setShouldFormReset] = useState(true)
  const [existingUserNames, setExistingUserNames] = useState([])
  const [existingEmails, setExistingEmails] = useState([])
  const dispatch = useDispatch()
  const { loading, updating, info: user } = useSelector(selectUserPreview)

  useLayoutEffect(() => {
    dispatch(getUserById(uid))

    return () => {
      setDefaultFileList([])
      dispatch(clearUserPreview())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user && shouldFormReset) {
      if (user.avatarUrl || user.accounts?.length > 0) {
        setDefaultFileList([
          {
            uid: '0',
            status: 'done',
            path: user.avatarUrl,
            thumbUrl: user.avatarUrl || user.accounts[0]?.photos[0]?.value,
          },
        ])
      } else {
        setDefaultFileList([])
      }

      if (shouldFormReset) {
        setShouldFormReset(false)
      }
    }
  }, [user, shouldFormReset])

  useEffect(() => {
    if (updating) {
      UpdatingMessage()
    } else {
      updatingMessage.destroy('updatingUserAcc')
    }
  }, [updating])

  const handleSubmit = useCallback(
    async (values, { setFieldError }) => {
      try {
        const updatedData = new FormData()

        Object.entries(values).forEach(([key, value]) => {
          if (key === 'avatar') {
            updatedData.append(key, value?.path ?? value ?? undefined)
          } else {
            updatedData.append(key, value)
          }
        })

        const { message } = await dispatch(
          updateUser({ uid, updatedData, updateFor: 'preview' })
        ).unwrap()

        dispatch(
          createNotification({
            id: 'updateUserSuccess',
            type: 'success',
            title: 'Success!',
            description: message,
          })
        )

        setShouldFormReset(true)
        setActiveTabKey('user-info')
      } catch (error) {
        const {
          status,
          statusText,
          data: { errors, message },
        } = error

        dispatch(
          createNotification({
            id: 'updateUserError',
            type: 'error',
            title: `Error, ${statusText}`,
            description:
              message ||
              'Something went wrong while updating a user account, please try again later.',
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
    [dispatch, uid]
  )

  return (
    <div className='UpdateUserPageWrapper'>
      {loading ? (
        <Spin size='large' />
      ) : (
        <Formik
          enableReinitialize
          initialTouched={{
            avatar: true,
            userName: true,
            email: true,
            isAdmin: true,
          }}
          initialValues={{
            avatar: defaultFileList?.length > 0 ? defaultFileList[0] : null,
            userName: user?.userName || user?.accounts[0]?.displayName,
            email: user?.email || user?.accounts[0]?.emails[0]?.value,
            isAdmin: user?.isAdmin || false,
          }}
          onSubmit={handleSubmit}
          validationSchema={updateUserValidationSchema(
            existingUserNames,
            existingEmails
          )}>
          {({
            dirty,
            isValid,
            handleSubmit: submitForm,
            setFieldValue,
            values: { userName, email, isAdmin },
          }) => (
            <>
              <RouterPrompt when={dirty} />
              <div className='UpdateUserPage'>
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
                        <Field
                          name='avatar'
                          component={AvatarUpload}
                          defaultFileList={defaultFileList}
                        />
                      </Form>
                      <div className='user-name-wrapper'>
                        <h1 className='user-name'>
                          {userName || 'Updated User'}
                        </h1>
                        <h2 className='user-email'>
                          {email || 'updateduser@example.com'}
                        </h2>
                        <p>User Details</p>
                      </div>
                    </div>
                  </div>
                  <div className='form-actions'>
                    <SubmitButton
                      size='large'
                      style={{ marginRight: '1rem' }}
                      icon={<SaveOutlined />}
                      disabled={!dirty || !isValid}
                      onClick={() => submitForm()}>
                      Save
                    </SubmitButton>
                    <ResetButton
                      size='large'
                      style={{
                        marginRight: '1rem',
                      }}
                      icon={<UndoOutlined />}
                      onClick={() => {
                        setShouldFormReset(true)
                      }}>
                      Reset
                    </ResetButton>
                    <Button
                      danger
                      size='large'
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        DeleteConfirmPrompt({
                          title:
                            'Are you sure that you want to delete this user?',
                          onOk: async () => {
                            try {
                              const {
                                data: { message },
                              } = await deleteUser(uid)

                              dispatch(
                                createNotification({
                                  id: 'deleteUserSuccess',
                                  type: 'success',
                                  title: 'Success!',
                                  description: message,
                                })
                              )

                              history.push('/admin/users')
                            } catch (error) {
                              dispatch(
                                createNotification({
                                  id: 'deleteUserError',
                                  type: 'error',
                                  title: 'Error!',
                                  description:
                                    'Something went wrong while deleteing a user account, please try again later.',
                                })
                              )
                            }
                          },
                        })
                      }>
                      Delete
                    </Button>
                  </div>
                </div>
                <Tabs
                  style={{ flexGrow: 1 }}
                  defaultActiveKey='user-info'
                  activeKey={activeTabKey}
                  onTabClick={activeKey => setActiveTabKey(activeKey)}>
                  <TabPane key='user-info' tab='Basic User Info'>
                    <Form name='user-info' layout='vertical'>
                      <Row gutter={[16, 8]}>
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
                            label='Email'
                            component={InputField}
                          />
                        </Col>
                        <Col span={8}>
                          <FormItem required name='isAdmin' label='isAdmin'>
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
                    </Form>
                  </TabPane>
                  <TabPane
                    style={{ width: '100%', height: '100%' }}
                    key='user-reviews'
                    tab='Purchased Products & Reviews'>
                    <Suspense
                      fallback={
                        <div
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            width: '100%',
                            height: '100%',
                          }}>
                          <Spin size='large' />
                        </div>
                      }>
                      <PurchasedProductsPage
                        uid={user?.id}
                        updateFor='preview'
                        purchasedProducts={user?.purchasedProducts}
                      />
                    </Suspense>
                  </TabPane>
                  <TabPane key='user-orders' tab='Orders'>
                    <Suspense
                      fallback={
                        <div
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            width: '100%',
                            height: '100%',
                          }}>
                          <Spin size='large' />
                        </div>
                      }>
                      <UserOrdersPage uid={user?.id} />
                    </Suspense>
                  </TabPane>
                </Tabs>
              </div>
            </>
          )}
        </Formik>
      )}
    </div>
  )
}

UpdateUserPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
}

export default UpdateUserPage
