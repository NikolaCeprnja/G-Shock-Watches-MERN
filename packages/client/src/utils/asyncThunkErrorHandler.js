import ErrorHandler from '@utils/ErrorHandler'

export default (err, rejectWithValue) => {
  if (err.response) {
    /* The request was made and the server responded with a status code
         that falls out of the range of 2xx */
    const { data, status, statusText } = err.response
    return rejectWithValue({ data, status, statusText })
  }

  if (err.request) {
    /* The request was made but no response was received
         `error.request` is an instance of XMLHttpRequest in the browser and an instance of
         http.ClientRequest in node.js */
    const { code, isAxiosError, message, stack } = err
    return rejectWithValue({ code, isAxiosError, message, stack })
  }

  // Something happened in setting up the request that triggered an Error
  return rejectWithValue({
    status: 500,
    statusText: 'Server Error',
    data: { message: 'Something went wrong, please try again later.' },
  })
}

export const handleAsyncThunkError = (
  thunkError,
  showBoundary,
  options = { redirect: undefined, showBoundaryOnlyOnServerError: undefined }
) => {
  if (thunkError.name !== 'AbortError') {
    const {
      status,
      statusText,
      data: { error, message } = {
        error: undefined,
        message: undefined,
      },
    } = thunkError

    const boundaryError = new ErrorHandler(message, status, statusText, {
      ...(error && { cause: error }),
      redirect: options.redirect,
    })

    if (options.showBoundaryOnlyOnServerError) {
      if (status >= 500) {
        showBoundary(boundaryError)
      }
      return
    }

    showBoundary(boundaryError)
  }
}
