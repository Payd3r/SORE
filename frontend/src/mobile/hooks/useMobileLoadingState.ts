interface MobileLoadingStateInput<TData> {
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  data?: TData | null;
}

export function useMobileLoadingState<TData>({
  isLoading,
  isFetching = false,
  isError = false,
  data,
}: MobileLoadingStateInput<TData>) {
  const hasData = data !== null && data !== undefined;

  return {
    showSkeleton: isLoading && !hasData,
    showSoftRefreshing: isFetching && hasData,
    showError: isError,
  };
}
