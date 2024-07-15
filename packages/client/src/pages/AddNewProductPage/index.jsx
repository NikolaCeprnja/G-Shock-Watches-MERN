import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { generatePath } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useErrorBoundary } from 'react-error-boundary'
import { Button, Tabs, Row, Col } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Formik, FastField } from 'formik'
import { Form, Select, SubmitButton } from 'formik-antd'

import RouterPrompt from '@components/RouterPrompt/index'
import InputField from '@components/InputField/index'
import SelectField from '@components/SelectField/index'
import DragImagesUpload from '@components/DragImagesUpload/index'

import { selectCollections } from '@redux/collection/collectionSlice'
import { getCollections } from '@redux/collection/collectionThunk'
import { create as createNotification } from '@redux/notification/notificationSlice'

import { createNewProduct } from '@api/product/index'
import { productValidationSchema } from '@validation/product-validation'

import ProductImgPlaceholder from '@assets/product-img-placeholder.png'
import {
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_TYPES_OPTIONS,
  PRODUCT_MATERIALS_OPTIONS,
  PRODUCT_MAIN_FEATURES_OPTIONS,
} from '@shared/constants'

import ErrorHandler from '@utils/ErrorHandler'
import { handleAsyncThunkError } from '@utils/asyncThunkErrorHandler'

import './styles.scss'

const { TabPane } = Tabs
const { OptGroup, Option } = Select

const AddNewProductPage = ({ history, match }) => {
  const dispatch = useDispatch()
  const collections = useSelector(selectCollections)
  const source = axios.CancelToken.source()
  const { showBoundary } = useErrorBoundary()
  const { activeTab } = match.params
  const [existingModels, setExistingModels] = useState([])

  useEffect(() => {
    let response

    const fetchCollections = async () => {
      try {
        response = dispatch(getCollections())
        await response?.unwrap?.()
      } catch (err) {
        handleAsyncThunkError(err, showBoundary)
      }
    }

    fetchCollections()

    return () => {
      response?.abort?.('Request Aborted due to component unmount.')
      source.cancel('Request Aborted due to component unmount.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, showBoundary])

  const handleSubmit = useCallback(
    async (values, { setFieldError, resetForm }) => {
      try {
        const data = new FormData()

        Object.keys(values).forEach(key => {
          if (Array.isArray(values[key])) {
            values[key].forEach(val => {
              data.append(`${key}[]`, val)
            })
          } else {
            data.append(key, values[key])
          }
        })

        const {
          data: { message },
        } = await createNewProduct(data, source.token)

        dispatch(
          createNotification({
            id: 'newProductCreatedSuccess',
            type: 'success',
            title: 'Success!',
            description: message,
          })
        )

        resetForm()
        history.replace(generatePath(match.path))
      } catch (error) {
        if (!axios.isCancel(error) && error.response) {
          const {
            status,
            statusText,
            data: { errors, message },
          } = error.response

          if (status === 500) {
            const boundaryError = new ErrorHandler(
              message,
              status,
              statusText,
              {
                redirect: {
                  to: '/admin/e-commerce/products',
                  text: 'Back to Products',
                },
              }
            )

            showBoundary(boundaryError)
            return
          }

          dispatch(
            createNotification({
              id: 'newProductCreatedError',
              type: 'error',
              title: `Error, ${statusText}`,
              description:
                message ||
                'Something went wrong while creating a new product, please try again later.',
            })
          )

          if (errors) {
            Object.keys(errors).forEach(err => {
              if (err === 'model') {
                setExistingModels(exModels => [...exModels, errors[err].value])
              }
              setFieldError(err, errors[err].message)
            })
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, showBoundary, source.token]
  )

  return (
    <Formik
      initialValues={{
        name: '',
        model: '',
        collectionName: undefined,
        desc: '',
        images: undefined,
        previewImg: null,
        price: undefined,
        discount: 0,
        inStock: undefined,
        color: undefined,
        types: undefined,
        materials: undefined,
        mainFeatures: undefined,
        specifications: undefined,
      }}
      onSubmit={handleSubmit}
      validationSchema={productValidationSchema(existingModels)}>
      {({
        dirty,
        isValid,
        handleSubmit: submitForm,
        setFieldValue,
        values: {
          name,
          model,
          previewImg,
          price,
          discount,
          inStock,
          color,
          types,
          materials,
          mainFeatures,
        },
      }) => (
        <>
          <RouterPrompt when={dirty} />
          <div className='AddNewProductPage'>
            <div className='caption'>
              <div className='product-preview-wrapper'>
                <Button
                  type='link'
                  style={{ padding: 0 }}
                  className='product-back-arrow'
                  icon={<ArrowLeftOutlined />}
                  onClick={() => history.push('/admin/e-commerce/products')}>
                  Products
                </Button>
                <div className='new-product-preview'>
                  <img
                    src={previewImg?.thumbUrl || ProductImgPlaceholder}
                    alt='product-img-preview'
                    width='48px'
                    height='48px'
                  />
                  <div className='product-name-wrapper'>
                    <h1 className='product-name'>
                      {model
                        ? `${name || 'New Product'}-${model}`
                        : name || 'New Product'}
                    </h1>
                    <p>Product Details</p>
                  </div>
                </div>
              </div>
              <SubmitButton
                size='large'
                icon={<SaveOutlined />}
                disabled={!dirty || !isValid}
                onClick={() => submitForm()}>
                Save
              </SubmitButton>
            </div>
            <Tabs
              defaultActiveKey='info'
              activeKey={activeTab || 'info'}
              onTabClick={activeKey => {
                const generatedPath = generatePath(match.path, {
                  activeTab: activeKey,
                })

                history.replace(generatedPath)
              }}>
              <TabPane key='info' tab='Basic Product Info'>
                <Form name='product-info' layout='vertical'>
                  <Row gutter={[16, 8]}>
                    <Col span={8}>
                      <FastField
                        fast
                        required
                        size='large'
                        name='name'
                        label='Name'
                        component={InputField}
                      />
                    </Col>
                    <Col span={8}>
                      <FastField
                        fast
                        required
                        size='large'
                        name='model'
                        label='Model'
                        component={InputField}
                      />
                    </Col>
                    <Col span={8}>
                      <FastField
                        fast
                        required
                        size='large'
                        name='collectionName'
                        showSearch
                        loading={collections.loading}
                        label='Collection Name'
                        component={SelectField}>
                        {Object.entries(collections).map(
                          ([key, value]) =>
                            value.data && (
                              <OptGroup
                                key={key}
                                label={
                                  key.charAt(0).toUpperCase() + key.slice(1)
                                }>
                                {value.data.map(collection => (
                                  <Option
                                    key={collection.id}
                                    value={collection.name}>
                                    {collection.name}
                                  </Option>
                                ))}
                              </OptGroup>
                            )
                        )}
                        {!collections.loading && (
                          <OptGroup key='special' label='Special'>
                            <Option
                              key='limited-edition'
                              value='LIMITED EDITION'>
                              LIMITED EDITION
                            </Option>
                          </OptGroup>
                        )}
                      </FastField>
                    </Col>
                  </Row>
                  <Row gutter={[16, 8]}>
                    <Col span={4}>
                      <FastField
                        fast
                        required
                        size='large'
                        name='color'
                        label='Color'
                        value={color}
                        dropdownMatchSelectWidth={false}
                        dropdownClassName='select-color-dropdown'
                        component={SelectField}>
                        {PRODUCT_COLOR_OPTIONS}
                      </FastField>
                    </Col>
                    <Col span={8}>
                      <FastField
                        fast
                        required
                        size='large'
                        style={{ width: '100%' }}
                        name='price'
                        type='number'
                        value={price}
                        label='Price'
                        formatter={value =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onChange={value => setFieldValue('price', value)}
                        component={InputField}
                      />
                    </Col>
                    <Col span={4}>
                      <FastField
                        fast
                        required
                        size='large'
                        style={{ width: '100%' }}
                        name='discount'
                        type='number'
                        min={0}
                        max={100}
                        value={discount}
                        label='Discount'
                        formatter={value => `% ${value}`}
                        parser={value => value.replace('%', '')}
                        onChange={value => setFieldValue('discount', value)}
                        component={InputField}
                      />
                    </Col>
                    <Col span={8}>
                      <FastField
                        fast
                        required
                        size='large'
                        style={{ width: '100%' }}
                        name='inStock'
                        type='number'
                        min={0}
                        value={inStock}
                        label='In Stock'
                        formatter={value =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onChange={value => setFieldValue('inStock', value)}
                        component={InputField}
                      />
                    </Col>
                  </Row>
                  <Col span={24}>
                    <FastField
                      fast
                      required
                      rows={6}
                      size='large'
                      name='desc'
                      type='textArea'
                      label='Description'
                      component={InputField}
                    />
                  </Col>
                </Form>
              </TabPane>
              <TabPane key='images' tab='Product Images'>
                <Form name='product-images'>
                  <FastField fast name='images' component={DragImagesUpload} />
                </Form>
              </TabPane>
              <TabPane key='details' tab='Product Details'>
                <Form name='product-details' layout='vertical'>
                  <Col span={24}>
                    <FastField
                      fast
                      required
                      showArrow
                      mode='tags'
                      size='large'
                      name='materials'
                      value={materials}
                      onChange={value => setFieldValue('materials', value)}
                      label='Materials'
                      component={SelectField}>
                      {PRODUCT_MATERIALS_OPTIONS}
                    </FastField>
                  </Col>
                  <Col span={24}>
                    <FastField
                      fast
                      required
                      showArrow
                      mode='tags'
                      size='large'
                      name='types'
                      value={types}
                      onChange={value => setFieldValue('types', value)}
                      label='Types'
                      component={SelectField}>
                      {PRODUCT_TYPES_OPTIONS}
                    </FastField>
                  </Col>
                  <Col span={24}>
                    <FastField
                      fast
                      required
                      showArrow
                      mode='tags'
                      size='large'
                      name='mainFeatures'
                      value={mainFeatures}
                      onChange={value => setFieldValue('mainFeatures', value)}
                      label='Main Features'
                      component={SelectField}>
                      {PRODUCT_MAIN_FEATURES_OPTIONS}
                    </FastField>
                  </Col>
                  <Col span={24}>
                    <FastField
                      fast
                      required
                      rows={6}
                      size='large'
                      name='specifications'
                      type='textArea'
                      label='Specifications'
                      component={InputField}
                    />
                  </Col>
                </Form>
              </TabPane>
            </Tabs>
          </div>
        </>
      )}
    </Formik>
  )
}

AddNewProductPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
}

export default AddNewProductPage
