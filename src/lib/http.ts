export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiFailure = {
  data: null;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function success<T>(data: T, init?: ResponseInit) {
  return Response.json({ data, error: null } satisfies ApiSuccess<T>, init);
}

export function failure(
  code: string,
  message: string,
  status: number,
  init?: ResponseInit,
) {
  return Response.json(
    { data: null, error: { code, message } } satisfies ApiFailure,
    { ...init, status },
  );
}
