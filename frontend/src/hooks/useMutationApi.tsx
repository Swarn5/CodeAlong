import { useEffect } from "react";

import { pushError } from "../redux/slices/errorSlice";
import { pushSuccess } from "../redux/slices/successSlice";
import { useAppDispatch } from "../redux/store";

type MutationResult = [
  (param?: any) => void,
  {
    data: any;
    error: any;
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    isFetching: boolean;
    errorMsg: string;
    isLoadingOrFetching: boolean;
  }
];

// eslint-disable-next-line import/no-anonymous-default-export
export default ({
  apiHook,
  errorTitle,
  successTitle,
  errorDescription,
  successDescription,
  dispatchError = true,
  dispatchSuccess = false,
}: {
  apiHook: any;
  errorTitle?: string;
  successTitle?: string;
  errorDescription?: string;
  successDescription?: string;
  dispatchError?: boolean;
  dispatchSuccess?: boolean;
}): MutationResult => {
  const [
    mutation,
    { data, error, success, isError, isLoading, isSuccess, isFetching },
  ] = apiHook();
  const dispatch = useAppDispatch();
  const errorMsg = (error as any)?.data?.message || (error as any)?.error;

  useEffect(() => {
    if (isError && errorMsg && dispatchError && errorMsg !== "Auth failed") {
      dispatch(
        pushError({
          title: errorTitle || errorMsg || "Something went wrong",
          description: errorDescription || "Please try again.",
        })
      );
    }
  }, [
    isError,
    error,
  ]);
  useEffect(() => {
    if (isSuccess && dispatchSuccess) {
      dispatch(
        pushSuccess({
          title: successTitle || "Completed",
          description: successDescription || "api successfully fetched",
        })
      );
    }
  }, [
    isSuccess,
  ]);

  return [
    mutation,
    {
      data,
      isLoading,
      error,
      errorMsg,
      isError,
      isSuccess,
      isFetching,
      isLoadingOrFetching: isLoading || isFetching,
    },
  ];
};
