import React, {
  lazy,
  Suspense,
  useState,
  useReducer,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react'
import { useSelector } from 'react-redux'
import {
  Route,
  Switch,
  useParams,
  useHistory,
  useLocation,
} from 'react-router-dom'
import { Steps, Spin } from 'antd'

import ProtectedRoute from '@components/ProtectedRoute/index'

import { selectLoggedInUser } from '@redux/user/userSlice'
import { selectCartItems, selectCartItemsCount } from '@redux/cart/cartSlice'
import stepReducer from '@utils/checkoutStepReducer'
import { CHECKOUT_STEPS } from '@shared/constants'

import './styles.scss'

const SigninPage = lazy(() => import('@pages/SigninPage/index'))
const CheckoutSummaryPage = lazy(() =>
  import('@pages/CheckoutSummaryPage/index')
)
const CheckoutShippingPage = lazy(() =>
  import('@pages/CheckoutShippingPage/index')
)
const CheckoutFinishPage = lazy(() => import('@pages/CheckoutFinishPage/index'))

const { Step } = Steps

const CheckoutPage = () => {
  const { auth, info } = useSelector(selectLoggedInUser)
  const cartItems = useSelector(selectCartItems)
  const cartItemsCount = useSelector(selectCartItemsCount)
  const history = useHistory()
  const location = useLocation()
  const { currentStep } = useParams()
  const [current, setCurrent] = useState(1)
  const [stepState, stepDispatch] = useReducer(stepReducer, CHECKOUT_STEPS)

  const toggleStepAvailability = useCallback(
    stepIdx => {
      const currStep = stepState[stepIdx]

      switch (currStep.key) {
        case 'auth': {
          if (auth === 'authenticated') {
            stepDispatch({
              type: 'SET_MULTIPLE_PROPS',
              payload: {
                key: currStep.key,
                props: { status: 'finish', disabled: true },
              },
            })
            return
          }

          stepDispatch({
            type: 'SET_MULTIPLE_PROPS',
            payload: {
              key: currStep.key,
              props: { status: 'error', disabled: false },
            },
          })

          break
        }
        case 'checkout': {
          if (cartItemsCount === 0 && stepState[3].disabled) {
            stepDispatch({
              type: 'STATUS',
              payload: {
                key: currStep.key,
                status: 'error',
              },
            })
            return
          }

          stepDispatch({
            type: 'STATUS',
            payload: {
              key: currStep.key,
              status: 'finish',
            },
          })

          break
        }
        case 'shipping': {
          if (auth !== 'authenticated') {
            stepDispatch({
              type: 'AVAILABLE',
              payload: { key: currStep.key, disabled: true },
            })

            return
          }

          if (cartItemsCount === 0) {
            if (!stepState[3].disabled) {
              stepDispatch({
                type: 'AVAILABLE',
                payload: { key: currStep.key, disabled: true },
              })

              return
            }

            stepDispatch({
              type: 'SET_MULTIPLE_PROPS',
              payload: {
                key: currStep.key,
                props: { status: 'wait', disabled: true },
              },
            })

            return
          }

          stepDispatch({
            type: 'AVAILABLE',
            payload: { key: currStep.key, disabled: false },
          })

          break
        }
        default:
      }
    },
    [auth, cartItemsCount, stepState]
  )

  const onStepChange = useCallback(
    curStep => {
      history.push(stepState[curStep].path)
    },
    [history, stepState]
  )

  useLayoutEffect(() => {
    const activeStepIdx = stepState.findIndex(step =>
      step.path.endsWith(currentStep)
    )

    stepState.forEach((step, idx) => {
      toggleStepAvailability(idx)
    })

    if (activeStepIdx === -1) {
      return history.push('/checkout/summary')
    }

    const activeStep = stepState[activeStepIdx]

    if (!activeStep.disabled) {
      return history.push(stepState[activeStepIdx].path, { ...location.state })
    }

    const lastEnabledStep = stepState.findLastIndex(step => !step.disabled)
    return history.push(stepState[lastEnabledStep].path, { from: location })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, cartItemsCount])

  useEffect(() => {
    const activeStepIdx = stepState.findIndex(step =>
      step.path.endsWith(currentStep)
    )

    if (activeStepIdx === -1) {
      setCurrent(1)
      return history.push('/checkout/summary')
    }

    const activeStep = stepState[activeStepIdx]

    if (activeStep.disabled) {
      switch (activeStep.key) {
        case 'auth': {
          history.push(stepState[1].path, { from: location })
          return setCurrent(1)
        }
        case 'shipping': {
          if (auth !== 'authenticated') {
            history.push(stepState[0].path, { from: location })
            return setCurrent(0)
          }

          if (cartItemsCount === 0) {
            history.push(stepState[1].path, { from: location })
            return setCurrent(1)
          }

          break
        }
        default: {
          const lastEnabledStep = stepState.findLastIndex(
            step => !step.disabled
          )
          history.push(stepState[lastEnabledStep].path, {
            from: location,
          })
          return setCurrent(lastEnabledStep)
        }
      }
    }

    return setCurrent(activeStepIdx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepState, currentStep])

  return (
    <div className='CheckoutPage'>
      <Steps
        type='navigation'
        current={current}
        onChange={onStepChange}>
        {stepState.map(({ path, ...otherProps }) => (
          <Step {...otherProps} />
        ))}
      </Steps>
      <Suspense
        fallback={
          <div
            style={{
              flex: 1,
              display: 'flex',
            }}>
            <Spin size='large' />
          </div>
        }>
        <Switch>
          <Route
            exact
            path={['/checkout', '/checkout/summary']}
            component={CheckoutSummaryPage}
          />
          <ProtectedRoute
            exact
            path='/checkout/auth'
            to='/checkout/summary'
            component={SigninPage}
          />
          <ProtectedRoute
            exact
            isPrivate
            path='/checkout/shipping'
            to='/checkout/auth'
            cartItems={cartItems}
            loggedInUserEmail={info?.email}
            stepDispatch={stepDispatch}
            component={CheckoutShippingPage}
          />
          <ProtectedRoute
            exact
            isPrivate
            path='/checkout/finish'
            to='/checkout/auth'
            stepDispatch={stepDispatch}
            component={CheckoutFinishPage}
          />
        </Switch>
      </Suspense>
    </div>
  )
}

export default CheckoutPage
