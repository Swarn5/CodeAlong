import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { serverApi } from "../api/serverApi";
import { Token } from "../../types";
import { KJUR } from "jsrsasign";

type AuthState = {
  userId: string | null;
  token: string | null;
  refreshToken: string | null;
  loading : boolean;
};

// The initial state of the auth slice

const initialState: AuthState = {
  userId: "",
  token: null,
  refreshToken: null,
  loading : true,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState as AuthState,
  reducers: {
    setLogin: (state, action) => {
      // console.log("Setting login", action.payload);
      state.userId = action.payload.userId;
      state.refreshToken = action.payload.refreshToken;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      console.log("Logging out");
      state.userId = null;
      state.token = null;
      state.loading = false;
      state.refreshToken = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      serverApi.endpoints.login.matchFulfilled,
      (state, action: PayloadAction<Token>) => {
        const { token } = action.payload;
        const decodedToken = KJUR.jws.JWS.parse(token).payloadObj as any;
        
        state.userId = decodedToken.userId;
        state.token = token;
        state.refreshToken = action.payload.refreshToken;

      }
    );
    builder.addMatcher(serverApi.endpoints.logout.matchFulfilled, (state) => {
      console.log("Logging out extraReducer");
      state.userId = null;
      state.token = null;
      state.refreshToken = null;
    });
  },
});
export const { setLogin, setLogout , setLoading } = authSlice.actions;
export default authSlice.reducer;
