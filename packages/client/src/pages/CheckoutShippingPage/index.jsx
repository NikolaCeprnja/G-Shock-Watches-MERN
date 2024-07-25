import React, { useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useFormik, FormikProvider, Field } from 'formik'
import { Form, FormItem, SubmitButton } from 'formik-antd'
import { useErrorBoundary } from 'react-error-boundary'
import { Checkbox } from 'antd'
import { MailOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons'

import InputField from '@components/InputField/index'

import { createNewOrder } from '@api/order/index'
import orderValidationSchema from '@validation/order-validation'

import { removeAll as clearCartItems } from '@redux/cart/cartSlice'
import { create as createNotification } from '@redux/notification/notificationSlice'

import ErrorHandler from '@utils/ErrorHandler'

import './styles.scss'

const CheckoutShippingPage = ({
  history,
  cartItems,
  stepDispatch,
  loggedInUserEmail,
}) => {
  const isMounted = useRef()
  const dispatch = useDispatch()
  const source = axios.CancelToken.source()
  const { showBoundary } = useErrorBoundary()

  const handleSubmit = useCallback(
    async (values, { setFieldError, resetForm }) => {
      const { sameAddr, ...newOrderValues } = values
      const items = cartItems.map(({ id, quantity }) => ({
        id,
        quantity,
      }))

      try {
        const {
          data: { createdOrder, message },
        } = await createNewOrder({ items, ...newOrderValues }, source.token)

        dispatch(
          createNotification({
            id: 'newOrderCreatedSuccess',
            type: 'success',
            title: 'Success!',
            description: message,
          })
        )

        resetForm()
        dispatch(clearCartItems())

        stepDispatch({
          type: 'STATUS',
          payload: { key: 'checkout', status: 'finish' },
        })

        stepDispatch({
          type: 'STATUS',
          payload: { key: 'shipping', status: 'finish' },
        })

        stepDispatch({
          type: 'AVAILABLE',
          payload: { key: 'finish', disabled: false },
        })

        history.push('/checkout/finish', { createdOrder })
      } catch (error) {
        if (!axios.isCancel(error) && error.response) {
          const {
            status,
            statusText,
            data: { errors, message },
          } = error.response

          if (status === 500) {
            const boundaryError = new ErrorHandler(message, status, statusText)

            showBoundary(boundaryError)
            return
          }

          if (errors) {
            Object.keys(errors).forEach(err => {
              setFieldError(err, errors[err].message)
            })
            return
          }

          dispatch(
            createNotification({
              id: 'newOrderCreatedError',
              type: 'error',
              title: `Error, ${statusText}`,
              description:
                message ||
                'Something went wrong while creating an order, please try again later.',
            })
          )
        }
      }
    },
    [history, dispatch, stepDispatch, cartItems, showBoundary, source.token]
  )

  const formikProps = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
      address: { shipping: '', billing: '' },
      sameAddr: false,
    },
    validationSchema: orderValidationSchema(loggedInUserEmail),
    onSubmit: handleSubmit,
  })

  const {
    dirty,
    isValid,
    values: formikValues,
    setValues,
    setTouched,
    setFieldValue,
  } = formikProps

  useLayoutEffect(() => {
    isMounted.current = true

    const updateInitialState = async () => {
      if (isMounted.current) {
        if (sessionStorage.getItem('shippingDetails')) {
          const updatedValues = JSON.parse(
            sessionStorage.getItem('shippingDetails')
          )
          await setValues(updatedValues)

          const updatedTouchValues = Object.keys(updatedValues).reduce(
            (acc, key) => {
              if (
                typeof updatedValues[key] === 'object' &&
                updatedValues[key] !== null
              ) {
                acc[key] = {
                  ...Object.keys(updatedValues[key]).reduce((ac, k) => {
                    if (updatedValues[key][k] !== formikValues[key][k]) {
                      ac[k] = true
                    }

                    return ac
                  }, {}),
                }
              } else if (updatedValues[key] !== formikValues[key]) {
                acc[key] = true
              }

              return acc
            },
            {}
          )
          await setTouched(updatedTouchValues)
        }
      }
    }

    updateInitialState()

    return () => {
      isMounted.current = false
      source.cancel('Request Aborted due to component unmount.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (!isMounted.current) {
        sessionStorage.setItem('shippingDetails', JSON.stringify(formikValues))
      }
    }
  }, [formikValues, isMounted])

  return (
    <div className='CheckoutShippingPage'>
      <h1 className='shipping-title'>Shipping Details</h1>
      <FormikProvider value={formikProps}>
        <Form size='large' layout='vertical' className='shipping-details-form'>
          <Field
            name='email'
            type='email'
            prefix={<MailOutlined className='site-form-item-icon' />}
            placeholder='Additional email address'
            component={InputField}
          />
          <Field
            name='address.shipping'
            prefix={<CarOutlined className='site-form-item-icon' />}
            placeholder='Shipping Address'
            component={InputField}
          />
          <Field
            name='address.billing'
            prefix={<DollarOutlined className='site-form-item-icon' />}
            placeholder='Billing Address'
            component={InputField}
          />
          <FormItem name='sameAddr' noStyle>
            <Checkbox
              name='sameAddr'
              checked={formikValues.sameAddr}
              defaultChecked={formikValues.sameAddr}
              onChange={e => {
                setFieldValue('sameAddr', e.target.checked)
                if (e.target.checked) {
                  setFieldValue(
                    'address.billing',
                    formikValues.address.shipping
                  )
                }
              }}>
              Same shipping and billing address
            </Checkbox>
          </FormItem>
          <SubmitButton
            style={{ marginTop: '1rem', textTransform: 'capitalize' }}
            disabled={!dirty || !isValid}>
            Create an order
          </SubmitButton>
        </Form>
      </FormikProvider>
    </div>
  )
}

CheckoutShippingPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
  cartItems: PropTypes.arrayOf(Object).isRequired,
  stepDispatch: PropTypes.func.isRequired,
  loggedInUserEmail: PropTypes.string.isRequired,
}

export default CheckoutShippingPage
