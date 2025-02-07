import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  token: null,
  /**
   * State for holding username and validating remember me
   * status in checkbox in the login screen
   */
  username: null,
  account: null,
  permissions: null,
};

const authSlice = createSlice({
  name: 'punchStatus',
  initialState,
  reducers: {
    storeUsername: (state, {payload}) => {
      state.username = payload;
    },

    storeAccount: (state, {payload}) => {
      state.account = payload;
    },

    storePermissions: (state, {payload}) => {
      state.permissions = payload;
    },

    storeToken: (state, {payload}) => {
      state.token = payload;
    },

    resetToken: state => {
      state.token = null;
    },
  },
});

export const {
  storeToken,
  resetToken,
  storeAccount,
  storeUsername,
  storePermissions,
} = authSlice.actions;
export default authSlice.reducer;
