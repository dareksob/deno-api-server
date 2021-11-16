import { RequestError } from "./request.error.ts";

export class AccessDeniedError extends RequestError {
  constructor(
    message: string = "Access denied",
    status: number = 403,
    prevent?: Error,
  ) {
    super(message, status, prevent);
  }
}
