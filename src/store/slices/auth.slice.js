import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  /**
   * State for holding username and validating remember me
   * status in checkbox in the login screen
   */
  username: null,
  account: null,
  permissions: null,
  currentLanguage: "",
  contentsLabel: null,
  languages: null,
};

const authSlice = createSlice({
  name: "punchStatus",
  initialState,
  reducers: {
    storeUsername: (state, { payload }) => {
      state.username = payload;
    },

    storeAccount: (state, { payload }) => {
      state.account = payload;
    },

    storePermissions: (state, { payload }) => {
      state.permissions = payload;
    },

    storeToken: (state, { payload }) => {
      state.token = payload;
    },

    setCurrentLang: (state, { payload }) => {
      state.currentLanguage = payload;
    },

    setContentsLabel: (state, { payload }) => {
      state.contentsLabel = payload;
    },
    setLanguages: (state, { payload }) => {
      state.languages = payload;
    },

    resetToken: (state) => {
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
  setCurrentLang,
  setContentsLabel,
  setLanguages,
} = authSlice.actions;
export default authSlice.reducer;
