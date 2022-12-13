/* eslint-disable import/prefer-default-export */
import * as Yup from 'yup'

const userNameValidation = (
  existingUserNames = [],
  errMsg = '',
  email = false
) =>
  Yup.string()
    .trim()
    .min(6, 'Must be at least 6 characters long.')
    .max(30, 'Maximum 30 characters long.')
    .required(`Please input your username${email ? ' or email' : ''}.`)
    .notOneOf(
      existingUserNames,
      errMsg || 'Username already taken, please try another one.'
    )

// TODO: add regex for password
const passwordValidation = (resetPass = false) =>
  Yup.string()
    .min(6, 'Must be at least 6 characters long.')
    .required(`Please input your ${resetPass ? 'new ' : ''}password.`)

export const signinValidationSchema = (nonExistingUsers, errMsg) =>
  Yup.object().shape({
    userNameOrEmail: userNameValidation(nonExistingUsers, errMsg, true),
    password: passwordValidation(),
  })
