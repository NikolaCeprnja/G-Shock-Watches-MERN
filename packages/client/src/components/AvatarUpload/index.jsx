import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Upload, Tooltip } from 'antd'
import { FormItem } from 'formik-antd'
import ImgCrop from 'antd-img-crop'
import { UploadOutlined } from '@ant-design/icons'

import './styles.scss'

const AvatarUpload = ({ form, field: { name, value } }) => {
  const { errors, setFieldValue } = form

  const [fileList, setFileList] = useState([])

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

  return (
    <FormItem
      className='form-item-upload'
      help={errors[name] ? errors[name] : undefined}
      validateStatus={errors[name] ? 'error' : 'success'}>
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
          name={name}
          accept='image/png, image/jpeg'
          className='avatar-uploader'
          maxCount={1}
          listType='picture-card'
          beforeUpload={file => {
            setFieldValue(name, file)
            if (file.size >= 1000000) {
              file.status = 'error'
            }
            file.thumbUrl = URL.createObjectURL(file)
            setFileList([file])
            return false
          }}
          fileList={fileList}
          onChange={handleChange}
          onRemove={() => {
            setFileList([])
            setFieldValue(name, undefined)
          }}>
          {!value ? uploadButton : null}
        </Upload>
      </ImgCrop>
    </FormItem>
  )
}

AvatarUpload.defaultProps = {
  form: {},
  field: {},
}

AvatarUpload.propTypes = {
  form: PropTypes.instanceOf(Object),
  field: PropTypes.instanceOf(Object),
}

export default AvatarUpload
