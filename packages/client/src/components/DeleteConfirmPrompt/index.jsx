import React from 'react'
import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal

function DeleteConfirmPrompt(props) {
  const {
    title = 'Are you sure that you want to delete this product?',
    icon = <ExclamationCircleOutlined />,
    content = 'This operation cannot be undone. Would you like to proceed?',
    okText = 'Yes',
    okType = 'danger',
    cancelText = 'No',
    onOk,
    onCancel,
    ...otherProps
  } = props

  return confirm({
    title,
    icon,
    content,
    okText,
    okType,
    cancelText,
    onOk,
    onCancel,
    ...otherProps,
  })
}

export default DeleteConfirmPrompt
