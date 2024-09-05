import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';

type successState = {
  successTitle: string | null;
  successDescription: string | null;
};

const initialState = {
  successTitle: null,
  successDescription: null,
};

const successSlice = createSlice({
  name: 'success',
  initialState: initialState as successState,
  reducers: {
    pushSuccessWithoutTimeout: (
      state,
      action: PayloadAction<{ title: string; description?: string }>
    ) => {
      const { title, description } = action.payload;
      state.successTitle = title;
      state.successDescription = description || null;
    },
    clearSuccess: (state) => {
      console.log("clearSuccess");
      state.successTitle = null;
      state.successDescription = null;
    },
  },
});

export const pushSuccess =
  (error: { title: string; description?: string }) => (dispatch: Dispatch) => {
    dispatch(successSlice.actions.pushSuccessWithoutTimeout(error));
    setTimeout(() => {
      dispatch(successSlice.actions.clearSuccess());
    }, 5000);
  };

export const { pushSuccessWithoutTimeout, clearSuccess } = successSlice.actions;
export default successSlice.reducer;