import React, {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import PropTypes from 'prop-types'
import { useHistory, useRouteMatch, matchPath } from 'react-router-dom'

import { Modal } from 'antd'

const handleBeforeUnload = e => {
  e.preventDefault()
  e.returnValue = true
}

const RouterPrompt = ({ when, title, okText, cancelText }) => {
  const history = useHistory()
  const { path, url } = useRouteMatch()
  const baseUrlRef = useRef(url)
  const unblockHistoryRef = useRef()
  const [nextPath, setNextPath] = useState()
  const [showPrompt, setShowPrompt] = useState(false)

  useLayoutEffect(() => {
    const currPath = matchPath(baseUrlRef.current, { path, exact: true })

    if (currPath?.params?.activeTab) {
      baseUrlRef.current = currPath.url.replace(
        `/${currPath.params.activeTab}`,
        ''
      )
    }

    return () => {
      unblockHistoryRef.current?.()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (when) {
      /* Prevent loss of unsaved data by showing the browser-generated confirmation dialog
       when the user tries to refresh the page or close the current tab/navigate elsewhere */
      window.addEventListener('beforeunload', handleBeforeUnload)

      unblockHistoryRef.current = history.block(prompt => {
        const { pathname, search, state } = prompt

        const isSameRoutePath = matchPath(pathname, {
          path,
          exact: true,
        })

        const hasSameBaseUrl = pathname.startsWith(baseUrlRef.current)

        if ((isSameRoutePath === null && !hasSameBaseUrl) || !hasSameBaseUrl) {
          setNextPath({ pathname, search, state })
          setShowPrompt(true)
          return false
        }

        return undefined
      })

      return
    }

    if (unblockHistoryRef.current) {
      unblockHistoryRef.current()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [history, when, path])

  const handleOK = useCallback(() => {
    unblockHistoryRef.current?.()
    baseUrlRef.current = nextPath.pathname
    history.push(nextPath)
  }, [nextPath, history])

  const handleCancel = useCallback(() => {
    setShowPrompt(false)
  }, [])

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
  okText: 'Confirm',
  cancelText: 'Cancel',
}

RouterPrompt.propTypes = {
  when: PropTypes.bool.isRequired,
  title: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
}

export default RouterPrompt
