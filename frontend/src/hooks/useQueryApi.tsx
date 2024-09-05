import { useEffect } from "react";

import { pushSuccess } from "../redux/slices/successSlice";
import { pushError } from "../redux/slices/errorSlice";
import { useAppDispatch } from "../redux/store";

type QueryResult = {
  data: any;
  error: any;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  isFetching: boolean;
  errorMsg: string;
  isLoadingOrFetching: boolean;
  refetch: () => void;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default ({
  apiHook,
  params,
  errorTitle,
  errorDescription,
  options,
  dispatchError = true,
}: {
  apiHook: any;
  params?: any;
  errorTitle?: string;
  errorDescription?: string;
  options?: any;
  dispatchError?: boolean;
}): QueryResult => {
  const { data, error, isError, isLoading, isSuccess, isFetching, refetch  } =
    apiHook(params, {...options, refetchOnMountOrArgChange: true});
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
    errorMsg,
    dispatchError,
    dispatch,
    errorTitle,
    errorDescription,
  ]);

  return {
    data,
    isLoading,
    error,
    errorMsg,
    isError,
    isSuccess,
    isFetching,
    isLoadingOrFetching: isLoading || isFetching,
    refetch,
  };
};
