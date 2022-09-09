import { IRequest, IResponse } from "../types.ts";

export default class RequestEvent extends Event {
  readonly request: IRequest;
  readonly response: IResponse;

  constructor(type: string, request: IRequest, response: IResponse) {
    super(type);
    this.request = request;
    this.response = response;
  }
}
