import {
  IResponse,
  IRoute,
  IServerConfig,
  IStateMap,
} from "../definition/types.ts";
import { serve } from "../deps.ts";
import { RequestError } from "../errors/request.error.ts";
import { EEvent } from "../definition/event.ts";
import RouteEvent from "../definition/events/route.event.ts";
import RequestEvent from "../definition/events/request.event.ts";
import ErrorEvent from "../definition/events/error.event.ts";
import { Raw } from "./raw.ts";

export class Api {
  public routes: IRoute[] = [];

  public serverConfig: IServerConfig;
  public forceJsonResponse = true;
  public readonly props: IStateMap = new Map();

  constructor(serverConfig: IServerConfig) {
    this.serverConfig = serverConfig;
  }

  get host() {
    const hostname = this.serverConfig.hostname || "localhost";
    const port = this.serverConfig.port || 80;
    const proto = this.serverConfig.https ? "https" : "http";
    return `${proto}://${hostname}:${port}`;
  }

  /**
     * Add route to server stack
     * @param route
     */
  public addRoute(route: IRoute): Api {
    route.parent = this;

    dispatchEvent(new RouteEvent(EEvent.API_ADD_ROUTE, route));

    this.routes.push(route);
    return this;
  }

  getUrlByRequest(request: Request): URL {
    return new URL(request.url, this.host);
  }

  /**
     * resolve route by request
     *
     * @param request
     * @param {URL|null} url
     */
  public getRouteByRequest(request: Request, url?: URL): null | IRoute {
    url = url || this.getUrlByRequest(request);

    for (let route of this.routes) {
      if (route.methods.includes(request.method)) {
        if (route.isMatch(url)) {
          return route;
        }
      }
    }
    return null;
  }

  /**
     * start server listing on requests
     */
  public async listen() {
    const incoming = async (request: Request) => {
      const url = this.getUrlByRequest(request);
      let response: IResponse = {
        status: 200,
        headers: new Headers(),
      };

      try {
        dispatchEvent(
          new RequestEvent(EEvent.BEFORE_REQUEST, request, response),
        );

        const route = this.getRouteByRequest(request, url);

        if (route) {
          dispatchEvent(new RouteEvent(EEvent.BEFORE_ROUTE, route));
          const context = await route.execute(url, request, response);
          response = context.response;
          dispatchEvent(new RequestEvent(EEvent.AFTER_ROUTE_RESPONSE, request, response));
        } else {
          response.status = 404;
          dispatchEvent(
            new RequestEvent(EEvent.ROUTE_NOT_FOUND, request, response),
          );
        }
      } catch (e) {
        this.handleError(response, e);
    
        dispatchEvent(
          new ErrorEvent(EEvent.ROUTE_ERROR, e, { response, request }),
        );
      }

      try {
        if (response.body) {
          // pass raw content body
          if (response.body instanceof Raw) {
            response.body = response.body.body;
          } // auto transform to json
          else if (
            typeof response.body !== "string" &&
            !response.headers.has("Content-Type")
          ) {
            response.headers.set("Content-Type", "application/json");
            response.body = JSON.stringify(response.body);
          }
        }

        return new Response(response.body, { status: response.status, statusText: response.message, headers: response.headers });
      } catch (e) {
        dispatchEvent(
          new ErrorEvent(EEvent.CRITICAL_ERROR, e, { response, request }),
        );
        return new Response('', { status: response.status, statusText: e.message || 'Critical error' });
        
      }
    }

    // start server
    await serve(incoming, this.serverConfig);
  }

  protected handleError(response: IResponse, error: Error) {
    let body = response.body;
    let message: string | Object = error.message;

    if (this.forceJsonResponse) {
      message = { message };
    }

    if (error instanceof RequestError) {
      response.status = error.status;
    } else {
      response.status = 500;
    }

    if (typeof body === "object") {
      Object.assign(body, typeof message === "object" ? message : { message });
    } else {
      body = message;
    }

    response.body = body;
  }
}
