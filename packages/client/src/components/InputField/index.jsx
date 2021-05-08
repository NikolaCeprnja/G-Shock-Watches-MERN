import React from 'react'
import PropTypes from 'prop-types'
import { FormItem, Input } from 'formik-antd'
import { EyeTwoTone, EyeInvisibleTwoTone } from '@ant-design/icons'

const InputField = ({ form, field, type, ...props }) => {
  const { name } = field
  const { errors, touched } = form

  return (
    <FormItem
      hasFeedback={touched[name]}
      help={errors[name] && touched[name] ? errors[name] : undefined}
      validateStatus={errors[name] && touched[name] ? 'error' : 'success'}>
      {type !== 'password' ? (
        <Input {...field} {...props} />
      ) : (
        <Input.Password
          iconRender={visible =>
            visible ? <EyeTwoTone /> : <EyeInvisibleTwoTone />
          }
          {...field}
          {...props}
        />
      )}
    </FormItem>
  )
}

InputField.defaultProps = {
  form: {},
  field: {},
  type: '',
}

InputField.propTypes = {
  form: PropTypes.objectOf(PropTypes.any),
  field: PropTypes.objectOf(PropTypes.any),
  type: PropTypes.string,
}

export default InputField
