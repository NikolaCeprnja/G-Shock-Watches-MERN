import React from 'react'
import PropTypes from 'prop-types'
import { getIn } from 'formik'
import { FormItem, Input } from 'formik-antd'
import { InputNumber } from 'antd'
import { EyeTwoTone, EyeInvisibleTwoTone } from '@ant-design/icons'

const InputField = ({ form, field, type, label, required, ...props }) => {
  const { name } = field
  const errors = getIn(form.errors, name)
  const touched = getIn(form.touched, name)

  return (
    <FormItem
      label={label}
      required={required}
      hasFeedback={touched}
      help={errors && touched ? errors : undefined}
      validateStatus={errors && touched ? 'error' : 'success'}>
      {
        {
          '': <Input {...field} {...props} />,
          email: <Input {...field} {...props} />,
          password: (
            <Input.Password
              iconRender={visible =>
                visible ? <EyeTwoTone /> : <EyeInvisibleTwoTone />
              }
              {...field}
              {...props}
            />
          ),
          number: <InputNumber {...field} {...props} />,
          textArea: <Input.TextArea {...field} {...props} />,
        }[type]
      }
    </FormItem>
  )
}

InputField.defaultProps = {
  form: {},
  field: {},
  type: '',
  label: '',
  required: false,
}

InputField.propTypes = {
  form: PropTypes.instanceOf(Object),
  field: PropTypes.instanceOf(Object),
  type: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
}

export default InputField
