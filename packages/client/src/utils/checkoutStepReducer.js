const checkoutStepReducer = (state, action) => {
  switch (action.type) {
    case 'STATUS': {
      const { key, status } = action.payload
      const foundStep = state.find(step => step.key === key)

      if (foundStep) {
        return state.map(step =>
          step.key === key ? { ...step, status } : { ...step }
        )
      }

      return state
    }
    case 'AVAILABLE': {
      const { key, disabled } = action.payload
      const foundStep = state.find(step => step.key === key)

      if (foundStep) {
        return state.map(step =>
          step.key === key ? { ...step, disabled } : { ...step }
        )
      }

      return state
    }
    case 'SET_MULTIPLE_PROPS': {
      const { key, props } = action.payload
      const foundStep = state.find(step => step.key === key)

      if (foundStep) {
        return state.map(step =>
          step.key === key ? { ...step, ...props } : { ...step }
        )
      }

      return state
    }
    default:
      return state
  }
}

export default checkoutStepReducer
