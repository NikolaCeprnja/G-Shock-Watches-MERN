import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Upload, Tooltip } from 'antd'
import { getIn } from 'formik'
import { FormItem } from 'formik-antd'
import ImgCrop from 'antd-img-crop'
import { UploadOutlined } from '@ant-design/icons'

import './styles.scss'

const AvatarUpload = ({
  form,
  field: { name, value },
  defaultFileList,
  ...otherProps
}) => {
  const errors = getIn(form.errors, name)
  const { setFieldValue } = form
  const [fileList, setFileList] = useState(defaultFileList)

  const uploadButton = (
    <Tooltip title='Upload Your Profile Image' placement='bottom'>
      <div className='avatar-uploader-btn'>
        <UploadOutlined />
        <div>Upload</div>
      </div>
    </Tooltip>
  )

  const handleChange = info => {
    if (info.fileList[0] && info.file.status === 'error') {
      setFieldValue(name, info.file)
    }
  }

  const handleRemove = () => {
    setFileList([])
    setFieldValue(name, null)
  }

  useEffect(() => {
    setFileList(defaultFileList)
  }, [defaultFileList])

  useEffect(() => {
    if (!value || value === null) {
      setFileList([])
    }
  }, [value])

  return (
    <FormItem
      className='form-item-upload'
      help={errors || undefined}
      validateStatus={errors ? 'error' : 'success'}>
      <ImgCrop
        grid
        rotate
        shape='round'
        beforeCrop={file => {
          if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
            file.status = 'error'
            setFileList([file])
            return false
          }

          return true
        }}>
        <Upload
          {...otherProps}
          name={name}
          accept='image/png, image/jpeg'
          className='avatar-uploader'
          maxCount={1}
          listType='picture-card'
          beforeUpload={file => {
            setFieldValue(name, file)
            if (file.size >= 1000000) {
              file.status = 'error'
            } else {
              file.thumbUrl = URL.createObjectURL(file)
            }
            setFileList([file])
            return false
          }}
          fileList={fileList}
          defaultFileList={defaultFileList}
          onChange={handleChange}
          onRemove={handleRemove}>
          {!value ? uploadButton : null}
        </Upload>
      </ImgCrop>
    </FormItem>
  )
}

AvatarUpload.defaultProps = {
  form: {},
  field: {},
  defaultFileList: [],
}

AvatarUpload.propTypes = {
  form: PropTypes.instanceOf(Object),
  field: PropTypes.instanceOf(Object),
  defaultFileList: PropTypes.arrayOf(Object),
}

export default AvatarUpload
