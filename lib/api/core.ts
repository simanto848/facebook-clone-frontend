export interface RequestOptions extends RequestInit {
  token?: string;
  body?: any;
}

export interface ApiResult<T = any> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError || (typeof error === "object" && error !== null && "status" in error && "body" in error);
}
