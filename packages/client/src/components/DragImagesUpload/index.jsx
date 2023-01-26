import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Upload } from 'antd'
import { getIn } from 'formik'
import { FormItem } from 'formik-antd'
import { InboxOutlined, StarOutlined, StarFilled } from '@ant-design/icons'

import './styles.scss'

const { Dragger } = Upload
// TODO: add useCallback hook for onRemove and onDownload props

const DragImagesUpload = ({
  form,
  field: { name },
  defaultFileList,
  defaultSelectedPreviewImgUid,
  setRemovedFileList,
  ...otherProps
}) => {
  const errors = getIn(form.errors, name)
  const { setFieldValue } = form
  const [fileList, setFileList] = useState(defaultFileList)
  const [selectedPreviewImgUid, setSelectedPreviewImgUid] = useState(
    defaultSelectedPreviewImgUid
  )

  useEffect(() => {
    setFileList(defaultFileList)
    setSelectedPreviewImgUid(defaultSelectedPreviewImgUid)
  }, [defaultFileList, defaultSelectedPreviewImgUid])

  return (
    <FormItem
      // className='form-item-upload'
      help={errors || undefined}
      validateStatus={errors ? 'error' : 'success'}>
      <Dragger
        {...otherProps}
        multiple
        name={name}
        maxCount={5}
        fileList={fileList}
        accept='image/png, image/jpeg'
        className='drag-images-upload'
        listType='picture-card'
        showUploadList={{
          showDownloadIcon: true,
          downloadIcon: file =>
            selectedPreviewImgUid === file.uid ? (
              <StarFilled
                title='Unset Product Preview Image'
                style={{ color: 'gold' }}
              />
            ) : (
              <StarOutlined
                title='Set Product Preview Image'
                style={{
                  color: 'white',
                }}
              />
            ),
        }}
        beforeUpload={(f, listOfFiles) => {
          listOfFiles.forEach(file => {
            if (
              (file.type !== 'image/png' && file.type !== 'image/jpeg') ||
              file.size >= 1000000
            ) {
              file.status = 'error'
            } else {
              file.status = 'done'
              file.thumbUrl = URL.createObjectURL(file)
            }
          })

          setFileList([...fileList, ...listOfFiles])
          if (selectedPreviewImgUid) {
            setFieldValue(name, [
              ...listOfFiles,
              ...fileList.filter(file => file.uid !== selectedPreviewImgUid),
            ])
          } else {
            setFieldValue(name, [...fileList, ...listOfFiles])
          }

          return false
        }}
        onRemove={file => {
          if (setRemovedFileList && file.path) {
            setRemovedFileList(removedFileList => [
              ...removedFileList,
              file.path,
            ])
          }

          const newListOfFiles = fileList.filter(
            existingFile => existingFile.uid !== file.uid
          )
          setFileList(newListOfFiles)

          if (file.uid === selectedPreviewImgUid) {
            setSelectedPreviewImgUid('')
            setFieldValue('previewImg', null)
          }

          if (selectedPreviewImgUid) {
            setFieldValue(name, [
              ...newListOfFiles.filter(
                existingFile => existingFile.uid !== selectedPreviewImgUid
              ),
            ])
          } else {
            setFieldValue(name, newListOfFiles)
          }
        }}
        onDownload={file => {
          if (selectedPreviewImgUid === file.uid) {
            setSelectedPreviewImgUid('')
            setFieldValue(name, fileList)
            setFieldValue('previewImg', null)
          } else {
            const newListOfFiles = fileList.filter(
              existingFile => existingFile.uid !== file.uid
            )
            setSelectedPreviewImgUid(file.uid)
            setFieldValue('previewImg', file)
            setFieldValue(name, newListOfFiles)
          }
        }}>
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file(s) to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Support for a single or bulk upload. Strictly prohibit from uploading
          company data or other band files
        </p>
      </Dragger>
    </FormItem>
  )
}

DragImagesUpload.defaultProps = {
  form: {},
  field: {},
  defaultFileList: [],
  defaultSelectedPreviewImgUid: '',
  setRemovedFileList: undefined,
}

DragImagesUpload.propTypes = {
  form: PropTypes.instanceOf(Object),
  field: PropTypes.instanceOf(Object),
  defaultFileList: PropTypes.arrayOf(Object),
  defaultSelectedPreviewImgUid: PropTypes.string,
  setRemovedFileList: PropTypes.func,
}

export default DragImagesUpload
