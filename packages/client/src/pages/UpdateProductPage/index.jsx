import React, {
  useLayoutEffect,
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { generatePath } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useErrorBoundary } from 'react-error-boundary'
import { Button, Tabs, Row, Col, Spin, message as updatingMessage } from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UndoOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { Formik, FastField } from 'formik'
import { Form, Select, SubmitButton, ResetButton } from 'formik-antd'

import RouterPrompt from '@components/RouterPrompt/index'
import InputField from '@components/InputField/index'
import SelectField from '@components/SelectField/index'
import DragImagesUpload from '@components/DragImagesUpload/index'
import DeleteConfirmPrompt from '@components/DeleteConfirmPrompt/index'

import {
  clearProductPreview,
  selectProductsByType,
} from '@redux/product/productSlice'
import { getProductById, updateProduct } from '@redux/product/productThunk'
import { selectCollections } from '@redux/collection/collectionSlice'
import { getCollections } from '@redux/collection/collectionThunk'
import { create as createNotification } from '@redux/notification/notificationSlice'

import { deleteProduct } from '@api/product/index'
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
const UpdatingMessage = () => {
  updatingMessage.loading({
    key: 'updating',
    duration: 0,
    content: 'Updating the product...',
  })
}

const UpdateProductPage = ({ history, match }) => {
  const { pid, activeTab } = match.params
  const [shouldFormReset, setShouldFormReset] = useState(true)
  const [defaultFileList, setDefaultFileList] = useState([])
  const [removedFileList, setRemovedFileList] = useState([])
  const [existingModels, setExistingModels] = useState([])
  const dispatch = useDispatch()
  const collections = useSelector(selectCollections)
  const { loading, updating, data: product } = useSelector(
    selectProductsByType('preview')
  )
  const source = axios.CancelToken.source()
  const updateProductRef = useRef()
  const { showBoundary } = useErrorBoundary()

  useLayoutEffect(() => {
    let response

    const fetchCollections = async () => {
      try {
        response = dispatch(getCollections())
        await response?.unwrap?.()
      } catch (err) {
        handleAsyncThunkError(err, showBoundary, {
          redirect: {
            to: '/admin/e-commerce/products',
            text: 'Back to Products',
          },
        })
      }
    }

    fetchCollections()

    return () => {
      response?.abort?.('Request Aborted due to component unmount.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, showBoundary])

  useLayoutEffect(() => {
    let response

    const fetchProductById = async () => {
      try {
        response = dispatch(getProductById(pid))
        await response?.unwrap?.()
      } catch (err) {
        handleAsyncThunkError(err, showBoundary, {
          redirect: {
            to: '/admin/e-commerce/products',
            text: 'Back to Products',
          },
        })
      }
    }

    fetchProductById()

    return () => {
      setDefaultFileList([])
      dispatch(clearProductPreview())
      response?.abort?.('Request Aborted due to component unmount.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pid, showBoundary])

  useEffect(() => {
    return () => {
      updateProductRef.current?.abort?.(
        'Request Aborted due to component unmount.'
      )
      source.cancel('Request Aborted due to component unmount.')
      updatingMessage.destroy('updating')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (product && shouldFormReset) {
      setDefaultFileList([
        {
          uid: '0',
          name: product.previewImg.split('/').pop(),
          status: 'done',
          path: product.previewImg,
          url: product.previewImg,
          thumbUrl: product.previewImg,
        },
        ...product.images?.map((image, idx) => ({
          uid: `${idx + 1}`,
          name: image.split('/').pop(),
          status: 'done',
          path: image,
          url: image,
          thumbUrl: image,
        })),
      ])

      setShouldFormReset(false)
    }
  }, [product, shouldFormReset])

  useEffect(() => {
    if (updating) {
      UpdatingMessage()
    } else {
      updatingMessage.destroy('updating')
    }
  }, [updating])

  const handleSubmit = useCallback(
    async (values, { setFieldError }) => {
      try {
        const data = new FormData()

        Object.entries(values).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            return value.forEach(val => {
              if (key === 'images' && val.path) {
                return data.append(`${key}[]`, val.path)
              }

              return data.append(`${key}[]`, val)
            })
          }

          if (key === 'previewImg' && value.path) {
            return data.append(key, value.path)
          }

          return data.append(key, value)
        })

        if (removedFileList.length > 0) {
          removedFileList.forEach(removedFilePath =>
            data.append('removedFileList[]', removedFilePath)
          )
        }

        updateProductRef.current = dispatch(
          updateProduct({ pid, updatedData: data })
        )

        const { message } = await updateProductRef.current?.unwrap?.()

        dispatch(
          createNotification({
            id: 'updateProductSuccess',
            type: 'success',
            title: 'Success!',
            description: message,
          })
        )

        setShouldFormReset(true)
        history.replace(generatePath(match.path, { pid }))
      } catch (error) {
        if (!error.name || error.name !== 'AbortError') {
          const {
            status,
            statusText,
            data: { errors, message } = {
              errors: undefined,
              message: undefined,
            },
          } = error

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
              id: 'updateProductError',
              type: 'error',
              title: `Error, ${statusText}`,
              description:
                message ||
                'Something went wrong while updating a product, please try again later.',
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
    [dispatch, pid, removedFileList, history, match.path, showBoundary]
  )

  return (
    <div className='UpdateProductPageWrapper'>
      {loading ? (
        <Spin size='large' />
      ) : (
        <Formik
          validateOnMount
          enableReinitialize
          initialTouched={{
            name: true,
            model: true,
            collectionName: true,
            desc: true,
            images: true,
            previewImg: true,
            price: true,
            discount: true,
            inStock: true,
            color: true,
            types: true,
            materials: true,
            mainFeatures: true,
            specifications: true,
          }}
          initialValues={{
            name: product?.name,
            model: product?.model,
            collectionName: product?.collectionName,
            desc: product?.desc,
            images:
              defaultFileList?.length > 1
                ? [...defaultFileList.slice(1)]
                : undefined,
            previewImg:
              defaultFileList?.length > 0 ? defaultFileList[0] : undefined,
            price: product?.price,
            discount: product?.discount || 0,
            inStock: product?.inStock,
            color: product?.color,
            types: product?.types,
            materials: product?.materials,
            mainFeatures: product?.mainFeatures,
            specifications: product?.specifications?.join('\n'),
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
              <div className='UpdateProductPage'>
                <div className='caption'>
                  <div className='product-preview-wrapper'>
                    <Button
                      type='link'
                      style={{ padding: 0 }}
                      className='product-back-arrow'
                      icon={<ArrowLeftOutlined />}
                      onClick={() =>
                        history.push('/admin/e-commerce/products')
                      }>
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
                        setDefaultFileList([])
                        setRemovedFileList([])
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
                          onOk: async () => {
                            try {
                              const {
                                data: { message },
                              } = await deleteProduct(pid, source.token)

                              dispatch(
                                createNotification({
                                  id: 'deleteProductSuccess',
                                  type: 'success',
                                  title: 'Success!',
                                  description: message,
                                })
                              )

                              history.push('/admin/e-commerce/products')
                            } catch (error) {
                              dispatch(
                                createNotification({
                                  id: 'deleteProductError',
                                  type: 'error',
                                  title: 'Error!',
                                  description:
                                    'Something went wrong while deleteing a product, please try again later.',
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
                  defaultActiveKey='info'
                  activeKey={activeTab || 'info'}
                  onTabClick={activeKey => {
                    const generatedPath = generatePath(match.path, {
                      pid,
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
                                  value='limited-edition'>
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
                            onChange={value =>
                              setFieldValue('discount', value || 0)
                            }
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
                      <FastField
                        fast
                        name='images'
                        component={DragImagesUpload}
                        defaultFileList={defaultFileList}
                        defaultSelectedPreviewImgUid='0'
                        setRemovedFileList={setRemovedFileList}
                      />
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
                          onChange={value =>
                            setFieldValue('mainFeatures', value)
                          }
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
      )}
    </div>
  )
}

UpdateProductPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
}

export default UpdateProductPage
