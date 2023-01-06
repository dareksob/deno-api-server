import { Api, EMethod, Route } from "../../mod.ts";

/**
 * @example plugin(api, { log: console.log })
 **/
export default function plugin(api: Api, config: IConfig) {
  /**
   * preset healthcheck endpoint
   */
  api.addRoute(new Route([EMethod.HEAD, EMethod.GET], "/healthz"));
}
