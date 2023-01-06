import { Api, EMethod, Route } from "../../mod.ts";

interface IConfig {
  uri?: string
}

/**
 * get status 200 for this healthcheck endpoint
 * @example plugin(api)
 **/
export default function plugin(api: Api, config: IConfig = {}) {
  api.addRoute(new Route([EMethod.HEAD, EMethod.GET], config?.uri ?? "/healthz"));
}
