import {configureStore} from '@reduxjs/toolkit';

import authSlice from './auth/authSlice';
import errorSlice from './slices/errorSlice';
import successSlice from './slices/successSlice';
import { useDispatch } from 'react-redux';
import { serverApi } from './api/serverApi';

const store = configureStore({
    reducer: {
        auth: authSlice,
        error : errorSlice,
        success : successSlice,
        [serverApi.reducerPath]: serverApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(serverApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;