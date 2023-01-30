import * as Yup from 'yup'

export default Yup.object().shape({
  title: Yup.string().trim().required('Title is required field.'),
  description: Yup.string()
    .trim()
    .min(10, 'Must be at least 10 characters long.')
    .max(600, 'Maximum 600 characters long.')
    .required('Description is required field.'),
  score: Yup.number()
    .positive('Must be a positive number')
    .min(1, 'Score needs to be a number between 1 and 5.')
    .max(5, 'Score needs to be a number between 1 and 5.')
    .required('Score is required field.'),
})
