import React from 'react'
import PropTypes from 'prop-types'
import { getIn } from 'formik'
import { FormItem, Select } from 'formik-antd'

const SelectField = ({
  form,
  field,
  label,
  required,
  loading,
  children,
  ...props
}) => {
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
      <Select {...field} {...props} loading={loading}>
        {children}
      </Select>
    </FormItem>
  )
}

SelectField.defaultProps = {
  form: {},
  field: {},
  label: '',
  required: false,
  loading: false,
  children: null,
}

SelectField.propTypes = {
  form: PropTypes.instanceOf(Object),
  field: PropTypes.instanceOf(Object),
  label: PropTypes.string,
  required: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node,
}

export default SelectField
