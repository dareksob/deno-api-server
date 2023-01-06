import { IContext, IRoute, IStateMap } from "../definition/types.ts";
import { mockRequest } from "./mock-request.ts";
import { mockResponse } from "./mock-response.ts";
import { Route } from "../services/route.ts";

interface ISetting {
  method?: string;
  url?: string;
  route?: IRoute;
  state?: IStateMap;
}

export function mockContext(setting: ISetting = {}): IContext {
  let route = <Route> setting?.route;
  let uri = <string> setting?.url;

  if (!route) {
    route = new Route(
      setting?.method || "GET",
      setting?.url || "/",
    );
  }

  if (!uri) {
    uri = "/";

    if (route) {
      uri = route.matcher.uri;
    }
  }

  return {
    route,
    di: route.di,
    match: {
      params: new Map(),
      url: new URL(uri, "http://localhost"),
      uri,
      matches: [] as RegExpMatchArray,
    },
    url: new URL(uri, "http://localhost"),
    request: mockRequest(setting?.method || route.methods[0], uri),
    response: mockResponse(),
    state: setting?.state || new Map(),
  };
}
