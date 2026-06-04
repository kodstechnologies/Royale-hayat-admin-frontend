type ApiErrorPayload = {
  message?: string;
  meta?: string[] | Record<string, unknown> | null;
};

type ApiErrorLike = {
  response?: {
    data?: ApiErrorPayload;
  };
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
): string => {
  const err = error as ApiErrorLike;
  const data = err?.response?.data;
  const meta = data?.meta;

  if (Array.isArray(meta) && meta.length > 0) {
    return meta.filter(Boolean).join(". ");
  }

  const message = data?.message?.trim();
  return message || fallback;
};

export const showApiErrorToast = (
  error: unknown,
  fallback: string,
  toastFn: (message: string) => void,
) => {
  const err = error as ApiErrorLike;
  const meta = err?.response?.data?.meta;

  if (Array.isArray(meta) && meta.length > 1) {
    meta.filter(Boolean).forEach((message) => toastFn(String(message)));
    return;
  }

  toastFn(getApiErrorMessage(error, fallback));
};
