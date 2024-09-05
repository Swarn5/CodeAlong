import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearError } from "../redux/slices/errorSlice";
import { useAppDispatch } from "../redux/store";

const ErrorToast = () => {
  const dispatch = useAppDispatch();
  const { errorTitle, errorDescription } = useSelector(
    (state: any) => state.error
  );

  useEffect(() => {
    if (errorTitle && errorDescription) {
      toast.error(
        <div>
          <h1>{errorTitle}</h1>
          <p className="text-sm text-zinc-400 pt-1">{errorDescription}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          
        }
      );
      dispatch(clearError());
    }
  }, [errorTitle, errorDescription , dispatch]);

  return <></>;
};

export default ErrorToast;
