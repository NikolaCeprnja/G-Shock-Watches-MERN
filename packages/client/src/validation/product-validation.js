/* eslint-disable import/prefer-default-export */
import * as Yup from 'yup'

const nameValidation = Yup.string()
  .trim()
  .min(5, 'Must be at least 5 characters long.')
  .max(30, 'Maximum 30 characters long.')
  .required('Name is required field.')

const modelValidation = Yup.string()
  .trim()
  .min(2, 'Must be at least 2 characters long.')
  .required('Model is required field.')

const collectionNameValidation = Yup.string()
  .trim()
  .required('Collection name is required field.')

const colorValidation = Yup.string().trim().required('Color is required field.')

const priceValidation = Yup.number()
  .min(99.99, "Price can't be less then $99.99")
  .required('Price is required field.')

const discountValidation = Yup.mixed().optional()

const inStockValidation = Yup.number()
  .positive('Must be a positive number')
  .required('In Stock is required field')

const descriptionValidation = Yup.string()
  .trim()
  .required('Description is required field.')

const imagesValidation = Yup.array()
  .ensure()
  .test(
    'UPLOADED_IMAGES_EXISTS',
    'Images are required field.',
    (images, { parent: { previewImg } }) => {
      if (previewImg === null && images?.length === 0) {
        return false
      }

      return true
    }
  )
  .test(
    'PREVIEW_IMG_IS_SET',
    'Preview image needs to be set. In order to do that you need to hover over an image and click on the star icon.',
    (images, { parent: { previewImg } }) => {
      if (previewImg === null && images?.length > 0) {
        return false
      }

      return true
    }
  )

const materialsValidation = Yup.array()
  .of(Yup.string())
  .min(1, 'At least one material needs to be selected.')
  .required('Materials is required field.')

const typesValidation = Yup.array()
  .of(Yup.string())
  .min(1, 'At least one type needs to be selected.')
  .required('Types is required field.')

const mainFeaturesValidation = Yup.array()
  .of(Yup.string())
  .min(1, 'At least one main feature needs to be selected.')
  .required('Main features is required field.')

const specificationValidation = Yup.string()
  .trim()
  .required('Specifications is required field.')

export const productValidationSchema = Yup.object().shape({
  name: nameValidation,
  model: modelValidation,
  collectionName: collectionNameValidation,
  color: colorValidation,
  price: priceValidation,
  discount: discountValidation,
  inStock: inStockValidation,
  desc: descriptionValidation,
  images: imagesValidation,
  materials: materialsValidation,
  types: typesValidation,
  mainFeatures: mainFeaturesValidation,
  specifications: specificationValidation,
})
