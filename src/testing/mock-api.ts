import { Api } from "../services/api.ts";
import {
  IContext,
  IInjections,
  IRequest,
  IResponse,
  IRoute,
  IServerConfig,
} from "../definition/types.ts";
import { mockResponse } from "./mock-response.ts";
import { RequestError } from "../errors/request.error.ts";
import { mockRequest } from "../../dev_mod.ts";
import RequestEvent from "../definition/events/request.event.ts";
import {EEvent} from "../definition/event.ts";
import RouteEvent from "../definition/events/route.event.ts";
import ErrorEvent from "../definition/events/error.event.ts";

interface IErrorContext {
  url: URL;
  request: IRequest;
  response: IResponse;
}

export class MockApi extends Api {
  static readonly HOST = "http://localhost";
  public lastRoute?: IRoute | null;
  public lastContext?: IContext | IErrorContext | null;
  public lastError?: string | Error;

  private injections: IInjections = {};

  constructor(serverConfig: IServerConfig) {
    super(serverConfig);
  }

  public mockInjections(injectsions: IInjections): MockApi {
    this.injections = injectsions;
    return this;
  }

  /**
     * shorthand function
     *
     * @param method
     * @param uri
     * @param data
     */
  public sendByArguments(
    method: string,
    uri: string | URL,
    data: any = undefined,
  ) {
    const pathname = uri instanceof URL ? uri.pathname : `${uri}`;
    const request = mockRequest(method, pathname, data);
    return this.sendByRequest(request);
  }

  /**
     * request send method
     *
     * @param request
     * @param url
     */
  public async sendByRequest(request: IRequest, url?: URL) {
    url = url instanceof URL ? url : new URL(request.url, MockApi.HOST);

    const response = mockResponse();
    const route = this.getRouteByRequest(request, url);
    this.lastRoute = route;

    try {
      dispatchEvent(
          new RequestEvent(EEvent.BEFORE_REQUEST, request, response),
      );

      if (route) {
        const currentInjections = { ...route.di };
        route.di = Object.assign({}, route.di, this.injections);

        dispatchEvent(new RouteEvent(EEvent.BEFORE_ROUTE, route));
        this.lastContext = await route.execute(url, request, response);


        route.di = currentInjections;
      } else {
        dispatchEvent(
            new RequestEvent(EEvent.ROUTE_NOT_FOUND, request, response),
        );
        throw new RequestError("Not found", 404);
      }
    } catch (e) {
      this.handleError(response, e);
      this.lastError = e;
      this.lastContext = {
        url,
        request,
        response,
      };

      dispatchEvent(
          new ErrorEvent(EEvent.ROUTE_ERROR, e, { response, request }),
      );
    }
  }
}

export default function mockApi(route?: IRoute): MockApi {
  const api = new MockApi({ port: 80 });
  if (route) {
    api.addRoute(route);
  }
  return api;
}
