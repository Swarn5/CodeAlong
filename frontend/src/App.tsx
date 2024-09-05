import React, { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import PlaygroundPage from "./pages/PlaygroundPage";
import "./resizeObserverPolyfill"; // Import the polyfill
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import store, { useAppDispatch } from "./redux/store";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { setLoading, setLogin } from "./redux/auth/authSlice";
import { KJUR } from "jsrsasign";
import { useSelector } from "react-redux";
import LoadingSpinner from "./components/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessToast from "./components/SuccessToast";
import ErrorToast from "./components/ErrorToast";
import { Socket } from "socket.io-client";
import { SocketProvider, useSocket } from "./socket/SocketContext";

// ProtectedRoute checks if user is authenticated and redirects to login page if not
// AuthRoute checks if user is authenticated and redirects to home page if authenticated

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute Page={HomePage} />,
  },
  {
    path: "/homePage",
    element: <ProtectedRoute Page={HomePage} />,
  },
  {
    path: "/login",
    element: <AuthRoute Page={LoginPage} />,
  },
  {
    path: "/register",
    element: <AuthRoute Page={RegisterPage} />,
  },
  {
    path: "/playground/:roomId",
    element: <ProtectedRoute Page={PlaygroundPage} />,
  },
]);

function App() {
  // dispatch is used to dispatch actions to the Redux store
  const dispatch = useAppDispatch();
  const { socket } = useSocket();

  //below useEffect is used to listen for events from the server

  useEffect(() => {
    if (!socket) {
      return;
    }

    // socket.on listens for events from the server
    socket.on("connected", () => {
      console.log("Connected to socket");
    });

    // socket.off removes the event listener
    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      socket.off("connected");
      socket.off("disconnect");
    };
  }, [socket]);

  // Below useEffect is used to check if the user is already logged in by checking the token and refreshToken in localStorage
  // if user logs in successfully, the userId, token, and refreshToken are set in the local storage and the Redux store

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        // Parse the token to get the userId
        // payloadObj is an object containing the decoded payload of the jwt token
        const decodedToken = KJUR.jws.JWS.parse(token).payloadObj as any;
        // setLogin is an action creator that sets the userId, token, and refreshToken in the Redux store
        dispatch(
          setLogin({ userId: decodedToken.userId, token, refreshToken })
        );
      }
      dispatch(setLoading(false));
    };
    init();
  }, [dispatch]);

  const loading = useSelector((state: any) => state.auth.loading);

  return (
    <>
      {loading && <LoadingSpinner />}
      <RouterProvider router={router} />
      <ToastContainer />
      <SuccessToast />
      <ErrorToast />
    </>
  );
}

export default App;
