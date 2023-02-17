import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'

import { Modal } from 'antd'

const RouterPrompt = ({ when, onOk, onCancel, title, okText, cancelText }) => {
  const history = useHistory()

  const [showPrompt, setShowPrompt] = useState(false)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    if (when) {
      history.block(prompt => {
        setCurrentPath(prompt.pathname)
        setShowPrompt(true)
        return 'true'
      })
    } else {
      history.block(() => {})
    }

    return () => {
      history.block(() => {})
    }
  }, [history, when])

  const handleOK = useCallback(async () => {
    if (onOk) {
      const canRoute = await Promise.resolve(onOk())

      if (canRoute) {
        history.block(() => {})
        history.push(currentPath)
      }
    }
  }, [currentPath, history, onOk])

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel())

      if (canRoute) {
        history.block(() => {})
        history.push(currentPath)
      }
    }

    setShowPrompt(false)
  }, [currentPath, history, onCancel])

  return showPrompt ? (
    <Modal
      closable
      title={title}
      visible={showPrompt}
      onOk={handleOK}
      okText={okText}
      onCancel={handleCancel}
      cancelText={cancelText}>
      {`There are unsaved changes and all the data that you entered will be lost.\nAre
      you sure that you want to leave this page anyway?`}
    </Modal>
  ) : null
}

RouterPrompt.defaultProps = {
  title: 'Leave this page?',
  onOk: () => true,
  onCancel: () => false,
  okText: 'Confirm',
  cancelText: 'Cancel',
}

RouterPrompt.propTypes = {
  when: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  title: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
}

export default RouterPrompt
