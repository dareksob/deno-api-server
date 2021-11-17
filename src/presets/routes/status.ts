import { Route } from "../../services/route.ts";
import { IPipe } from "../../definition/types.ts";
import { EMethod } from "../../definition/method.ts";

interface routeConfig {
  uri?: string;
  body?: any;
  handler?: IPipe;
}/**
 * default factory for route
 * @param config
 */

export function createRoute(config: routeConfig) {
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

/**
 * preset status check endpoint
 */
export default createRoute({ uri: "/status", body: { status: "OK" } });
