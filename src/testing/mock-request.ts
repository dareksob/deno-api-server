import { ServerRequest } from "../deps.ts";
import { Buffer, BufReader } from "../dev_deps.ts";

/**
 * create server request object for testing
 *
 * @param method
 * @param url
 */
export function mockRequest(
  method: string,
  url: string,
  data: any = undefined,
): ServerRequest {
  const headers = new Headers();
  const request = new ServerRequest();
  request.method = `${method}`.toUpperCase();
  request.url = url;
  request.headers = headers;

  // json data
  if (data && typeof data === "object") {
    data = JSON.stringify(data);
    headers.set("content-type", "application/json");
  }

  // set body data
  if (typeof data === "string") {
    headers.set("content-length", `${data.length}`);
    const buffer = new Buffer(new TextEncoder().encode(data));
    request.r = new BufReader(buffer);
  }

  return request;
}
