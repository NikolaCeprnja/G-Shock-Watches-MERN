import * as Yup from 'yup'

export default (loggedInUserEmail = '') =>
  Yup.object().shape({
    email: Yup.string()
      .notRequired()
      .trim()
      .email('Invalid email address.')
      .notOneOf(
        [loggedInUserEmail],
        'Please provide another email, not one associated with your account'
      ),
    address: Yup.object().shape({
      shipping: Yup.string()
        .trim()
        .min(6, 'Must be at least 6 characters long.')
        .max(30, 'Maximum 30 characters long.')
        .required('Please input your shipping address.'),
      billing: Yup.string()
        .trim()
        .min(6, 'Must be at least 6 characters long.')
        .max(30, 'Maximum 30 characters long.')
        .required('Please input your billing address.'),
    }),
  })
