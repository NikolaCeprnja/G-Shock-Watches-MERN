import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import auth from '@api/user/auth'

// Thunks
export const signin = createAsyncThunk(
  'user/signin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await auth.signin(JSON.stringify(userData))
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const signup = createAsyncThunk(
  'user/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await auth.signup(userData)
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const signout = createAsyncThunk(
  'user/signout',
  async (user, { rejectWithValue }) => {
    try {
      const response = await auth.signout()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

export const authUser = createAsyncThunk(
  'user/auth',
  async (user, { rejectWithValue }) => {
    try {
      const response = await auth.authUser()
      const { data, status } = response
      return { ...data, status }
    } catch (err) {
      const { data, status, statusText } = err.response
      return rejectWithValue({
        data,
        status,
        statusText,
      })
    }
  }
)

const initialState = {
  auth: 'unauthenticated',
  loading: false,
  info: undefined,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: {
    [signin.pending]: state => {
      state.loading = true
    },
    [signin.fulfilled]: (state, { payload }) => {
      Object.assign(state, {
        signedIn: true,
        auth: 'authenticated',
        loading: false,
        info: { ...payload.loggedInUser },
      })
    },
    [signin.rejected]: state => {
      state.loading = false
    },
    [signup.pending]: state => {
      state.loading = true
    },
    [signup.fulfilled]: (state, { payload }) => {
      Object.assign(state, {
        signedIn: true,
        auth: 'authenticated',
        loading: false,
        info: { ...payload.signedUpUser },
      })
    },
    [signup.rejected]: state => {
      state.loading = false
    },
    [signout.fulfilled]: () => initialState,
    /*     [signout.rejected]: state => {
      state.loading = false
    }, */
    [authUser.pending]: state => {
      state.auth = 'authenticating'
    },
    [authUser.fulfilled]: (state, { payload }) => {
      Object.assign(state, {
        auth: 'authenticated',
        info: { ...payload.loggedInUser },
      })
    },
    [authUser.rejected]: state => {
      state.auth = 'unauthenticated'
    },
  },
})

// export const { } = userSlice.actions

export default userSlice.reducer
