import { Api, EEvent, RouteEvent } from "../../mod.ts";

interface IConfig {
  log: (...data: any[]) => void,
  title?: string,
}

/**
 * @example plugin(api, { log: console.log })
 * @param api 
 * @param config 
 */
export default function plugin(api: Api, config: IConfig) {
  addEventListener(EEvent.API_ADD_ROUTE, (event) => {
    if (event instanceof RouteEvent) {
      const {route} = <RouteEvent>event;
      const title = config.title ?? 'Add Route';
      config.log(`${title} ${route.methods.join(",")} ${route.matcher.uri}`);
    }
  });
}
