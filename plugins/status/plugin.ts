import { Api, EMethod, Route, IPipe } from "../../mod.ts";

interface IStatusRouteConfig {
  uri?: string;
  body?: any;
  handler?: IPipe;
}

/**
 * info only one method will be used, handler or body, json body are default
 */
export function createStatusRoute(config: IStatusRouteConfig = {}) {
  const route = new Route(EMethod.GET, config?.uri || "/status");

  if (typeof config?.handler === "function") {
    route.addPipe(config.handler);
  } else {
    route.addPipe(({ response }) => {
      response.body = config?.body || { status: "OK" };
    });
  }

  return route;
}

interface IConfig {
  body?: any;
  handler?: IPipe;
}

/**
 * default status route
 **/
export default function plugin(api: Api, config: IConfig = {}) {
  const statusConfig = {
    uri: "/status",
    body: Object.assign({ status: 'OK' }, config.body),
    handler: config.handler,
  }

  api.addRoute(createStatusRoute(statusConfig));
}
