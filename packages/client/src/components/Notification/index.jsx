import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { notification } from 'antd'

import { remove as removeNotification } from '@redux/notification/notificationSlice'

const Notification = ({ id, type, title, description, duration }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    notification[type]({
      key: id,
      top: 88,
      duration,
      description,
      message: title,
      onClose: async () => {
        await dispatch(removeNotification(id))
      },
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return null
}

Notification.defaultProps = {
  duration: 0,
}

Notification.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  duration: PropTypes.number,
  description: PropTypes.string.isRequired,
}

export default Notification
