/* eslint-disable import/prefer-default-export */
import * as Yup from 'yup'

const avatarValidation = Yup.mixed()
  .notRequired()
  .test(
    'FILE_TYPE',
    'Unsuported file selected.\nOnly .PNG or .JPEG (JPG) files are allowed.',
    value => {
      if (value && value.type) {
        return value.type === 'image/png' || value.type === 'image/jpeg'
      }

      return true
    }
  )
  .test('FILE_SIZE', 'Chosen file needs to be less then 1MB.', value => {
    if (value && value.size) {
      return value.size <= 1000000
    }

    return true
  })

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

const emailValidation = (existingEmails = []) =>
  Yup.string()
    .trim()
    .email('Invalid email address.')
    .required('Please input your email address.')
    .notOneOf(existingEmails, 'Email already taken, please try another one.')

// TODO: add regex for password
const passwordValidation = (resetPass = false) =>
  Yup.string()
    .min(6, 'Must be at least 6 characters long.')
    .required(`Please input your ${resetPass ? 'new ' : ''}password.`)

const confirmPasswordValidation = (passRef = 'password', resetPass = false) =>
  Yup.string()
    .min(6, 'Must be at least 6 characters long.')
    .oneOf([Yup.ref(passRef)], 'Password needs to be the same.')
    .required(`Please confirm your ${resetPass ? 'new ' : ''}password.`)

const isAdminValidation = Yup.bool().required('Is Admin is required field.')

export const signupValidationSchema = (
  existingUserNames,
  existingEmails,
  addNewUser = false
) =>
  Yup.object().shape({
    avatar: avatarValidation,
    userName: userNameValidation(existingUserNames),
    email: emailValidation(existingEmails),
    password: passwordValidation(),
    confirmPassword: confirmPasswordValidation(),
    isAdmin: addNewUser ? isAdminValidation : undefined,
  })

export const signinValidationSchema = (nonExistingUsers, errMsg) =>
  Yup.object().shape({
    userNameOrEmail: userNameValidation(nonExistingUsers, errMsg, true),
    password: passwordValidation(),
  })

export const forgotPassValidationSchema = (nonExistingUsers, errMsg) =>
  Yup.object().shape({
    userNameOrEmail: userNameValidation(nonExistingUsers, errMsg, true),
  })

export const resetPassValidationSchema = Yup.object().shape({
  newPassword: passwordValidation(true),
  confirmNewPassword: confirmPasswordValidation('newPassword', true),
})

