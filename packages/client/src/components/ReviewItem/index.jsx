/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Formik, Field } from 'formik'
import { Form, FormItem, SubmitButton, ResetButton } from 'formik-antd'
import { Comment, Rate, Button } from 'antd'
import {
  EditOutlined,
  SaveOutlined,
  UndoOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

import { updateReview, deleteReview } from '@redux/user/userThunk'
import { create as createNotification } from '@redux/notification/notificationSlice'

import updateReviewValidationSchema from '@validation/review-validation'

import InputField from '@components/InputField/index'
import DeleteConfirmPrompt from '@components/DeleteConfirmPrompt/index'

const ReviewItem = ({ productId, review, updateFor }) => {
  const dispatch = useDispatch()
  const [reviewEditing, setReviewEditing] = useState(false)

  const handleSubmit = useCallback(
    async ({ title, score, description }, { setFieldError }) => {
      try {
        const { message } = await dispatch(
          updateReview({
            rid: review.id,
            updatedData: {
              title,
              score,
              description,
            },
            updateFor,
          })
        ).unwrap()

        dispatch(
          createNotification({
            id: 'updateReviewSuccess',
            type: 'success',
            title: 'Success!',
            description: message,
          })
        )
        setReviewEditing(false)
      } catch (error) {
        const {
          status,
          statusText,
          data: { errors, message },
        } = error

        dispatch(
          createNotification({
            id: 'updateReviewError',
            type: 'error',
            title: `Error, ${statusText}`,
            description:
              message ||
              'Something went wrong while updating a review, please try again later.',
          })
        )

        if (errors) {
          Object.keys(errors).forEach(err => {
            setFieldError(err, errors[err].message)
          })
        }
      }
    },
    [dispatch, review.id, updateFor]
  )

  const handleReviewDelete = useCallback(() => {
    DeleteConfirmPrompt({
      title: 'Are you sure that you want to delete this review?',
      onOk: async () => {
        try {
          const { message } = await dispatch(
            deleteReview({ rid: review.id, updateFor })
          ).unwrap()

          dispatch(
            createNotification({
              id: 'deleteReviewSuccess',
              type: 'success',
              title: 'Success!',
              description: message,
            })
          )
        } catch (error) {
          const { status, statusText, message } = error
          dispatch(
            createNotification({
              id: 'deleteReviewError',
              type: 'error',
              title: statusText || 'Error!',
              description:
                message ||
                'Something went wrong while deleteing a review, please try again later.',
            })
          )
        }
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Formik
      enableReinitialize
      initialTouched={{
        title: true,
        description: true,
        score: true,
        createdAt: true,
      }}
      initialValues={{
        title: review.title,
        description: review.desc,
        score: review.score,
        createdAt: review.createdAt,
      }}
      onSubmit={handleSubmit}
      validationSchema={updateReviewValidationSchema}>
      {({
        dirty,
        isValid,
        handleReset,
        setFieldValue,
        values: { title, score, description, createdAt },
      }) => (
        <Comment
          key={review.id}
          datetime={createdAt}
          author={<h2>{title || 'Review Title'}</h2>}
          content={
            !reviewEditing ? (
              <>
                <Rate disabled allowHalf defaultValue={score} />
                <br />
                {description}
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    type='primary'
                    size='large'
                    style={{ marginRight: '1rem' }}
                    icon={<EditOutlined />}
                    onClick={() => {
                      setReviewEditing(true)
                    }}>
                    Edit
                  </Button>
                  <Button
                    danger
                    size='large'
                    icon={<DeleteOutlined />}
                    onClick={() => handleReviewDelete()}>
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <Form key={`form-${review.id}`} layout='horizontal' size='large'>
                <Field
                  required
                  name='title'
                  label='Title'
                  component={InputField}
                />
                <FormItem required name='score' label='Score'>
                  <Rate
                    allowHalf
                    allowClear
                    value={score}
                    defaultValue={score}
                    onChange={value => setFieldValue('score', value)}
                  />
                </FormItem>
                <Field
                  required
                  name='description'
                  label='Description'
                  type='textArea'
                  showCount
                  rows={5}
                  maxLength={600}
                  component={InputField}
                />
                <SubmitButton
                  size='large'
                  style={{ marginRight: '1rem' }}
                  icon={<SaveOutlined />}
                  disabled={!dirty || !isValid}>
                  Save
                </SubmitButton>
                <ResetButton
                  size='large'
                  style={{
                    marginRight: '1rem',
                  }}
                  icon={<UndoOutlined />}>
                  Reset
                </ResetButton>
                <Button
                  type='dashed'
                  size='large'
                  style={{
                    marginRight: '1rem',
                  }}
                  onClick={() => {
                    handleReset()
                    setReviewEditing(false)
                  }}>
                  Cancel
                </Button>
                <Button
                  danger
                  size='large'
                  icon={<DeleteOutlined />}
                  onClick={() => handleReviewDelete()}>
                  Delete
                </Button>
              </Form>
            )
          }
        />
      )}
    </Formik>
  )
}

ReviewItem.propTypes = {
  updateFor: PropTypes.string.isRequired,
  productId: PropTypes.string.isRequired,
  review: PropTypes.instanceOf(Object).isRequired,
}

export default ReviewItem
