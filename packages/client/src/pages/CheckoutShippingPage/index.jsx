import React, { useLayoutEffect, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withFormik, Field } from 'formik'
import { Form, FormItem, SubmitButton } from 'formik-antd'
import { Checkbox } from 'antd'
import { MailOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons'

import InputField from '@components/InputField/index'

import { createNewOrder } from '@api/order/index'
import orderValidationSchema from '@validation/order-validation'
import { removeAll } from '@redux/cart/cartSlice'
import { create as createNotification } from '@redux/notification/notificationSlice'

import './styles.scss'

const ShippingPage = ({
  dirty,
  isValid,
  values: formikValues,
  setValues,
  setTouched,
  setFieldValue,
}) => {
  const isMounted = useRef()

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
                setFieldValue('address.billing', formikValues.address.shipping)
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
    </div>
  )
}

ShippingPage.propTypes = {
  dirty: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.instanceOf(Object).isRequired,
  setValues: PropTypes.func.isRequired,
  setTouched: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => ({
  dispatchNotification: notification =>
    dispatch(createNotification(notification)),
  clearCartItems: () => dispatch(removeAll()),
})

const CheckoutShippingPage = connect(
  null,
  mapDispatchToProps
)(
  withFormik({
    displayName: 'CheckoutShippingPage',
    enableReinitialize: true,
    validationSchema: ({ loggedInUserEmail }) =>
      orderValidationSchema(loggedInUserEmail),
    mapPropsToValues: () => {
      const initialState = {
        email: '',
        address: { shipping: '', billing: '' },
        sameAddr: false,
      }
      return initialState
    },
    handleSubmit: async (values, { props, setFieldError, resetForm }) => {
      const { sameAddr, ...newOrderValues } = values
      const {
        history,
        cartItems,
        stepDispatch,
        dispatchNotification,
        clearCartItems,
      } = props
      const items = cartItems.map(({ id, quantity }) => ({
        id,
        quantity,
      }))

      try {
        const {
          data: { createdOrder, message },
        } = await createNewOrder({ items, ...newOrderValues })

        dispatchNotification({
          id: 'newOrderCreatedSuccess',
          type: 'success',
          title: 'Success!',
          description: message,
        })

        resetForm()
        clearCartItems()

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
      } catch ({ response }) {
        const {
          statusText,
          data: { errors, message },
        } = response

        if (errors) {
          Object.keys(errors).forEach(err => {
            setFieldError(err, errors[err].message)
          })
        } else {
          dispatchNotification({
            id: 'newOrderCreatedError',
            type: 'error',
            title: `Error, ${statusText}`,
            description:
              message ||
              'Something went wrong while creating an order, please try again later.',
          })
        }
      }
    },
  })(ShippingPage)
)

export default CheckoutShippingPage
