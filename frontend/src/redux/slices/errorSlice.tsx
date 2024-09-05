import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';

type ErrorState = {
  errorTitle: string | null;
  errorDescription: string | null;
};

const initialState = {
  errorTitle: null,
  errorDescription: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState: initialState as ErrorState,
  reducers: {
    pushErrorWithoutTimeout: (
      state,
      action: PayloadAction<{ title: string; description?: string }>
    ) => {
      const { title, description } = action.payload;
      state.errorTitle = title;
      state.errorDescription = description || null;
    },
    clearError: (state) => {
      state.errorTitle = null;
      state.errorDescription = null;
    },
  },
});

export const pushError =
  (error: { title: string; description?: string }) => (dispatch: Dispatch) => {
    dispatch(errorSlice.actions.pushErrorWithoutTimeout(error));
    setTimeout(() => {
      dispatch(errorSlice.actions.clearError());
    }, 5000);
  };

export const { pushErrorWithoutTimeout, clearError } = errorSlice.actions;
export default errorSlice.reducer;