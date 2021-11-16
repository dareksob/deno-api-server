import { RequestError } from "./request.error.ts";

export class BadRequestError extends RequestError {
  constructor(
    message: string = "Bad request",
    status: number = 400,
    prevent?: Error,
  ) {
    super(message, status, prevent);
  }
}
