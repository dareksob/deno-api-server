interface IMockOptions {
  host?: string
}

/**
 * create server request object for testing
 */
export function mockRequest(
  method: string,
  uri: string,
  data: any = undefined,
  options: IMockOptions = {}
): Request {
  const headers = new Headers();
  // deno-lint-ignore no-explicit-any
  let body: any;

  // json data
  if (data && typeof data === "object") {
    data = JSON.stringify(data);
    headers.set("content-type", "application/json");
  }

  // set body data
  if (typeof data === "string") {
    headers.set("content-length", `${data.length}`);
    body = data;
  }

  const url = new URL(uri, options.host ?? 'http://localhost');
  return new Request(`${url}`,{
    method: `${method}`.toUpperCase(),
    headers,
    body,
   });
}
