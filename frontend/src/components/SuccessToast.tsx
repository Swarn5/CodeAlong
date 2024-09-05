import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppDispatch } from "../redux/store";

const SuccessToast = () => {
  const dispatch = useAppDispatch();
  const { successTitle, successDescription } = useSelector(
    (state: any | undefined) => state.success
  );

  useEffect(() => {
    if (successTitle && successDescription) {
      const title = successTitle;
      const description = successDescription;
      toast.success(
        <div>
          <h1>{title}</h1>
          <p className="text-sm text-zinc-400 pt-1">{description}</p>
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
    }
  }, [successTitle, successDescription, dispatch]);

  return <></>;
};

export default SuccessToast;
