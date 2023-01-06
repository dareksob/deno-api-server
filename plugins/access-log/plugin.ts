import { Api, EEvent, RequestEvent } from "../../mod.ts";

interface IConfig {
  log: (...data: any[]) => void,
  noIgnoreCheck?: boolean,
  title?: string,
  ignorePatterns?: RegExp[]
}

/**
 * @example plugin(api, { log: console.log })
 * @param api 
 * @param config 
 */
export default function plugin(api: Api, config: IConfig) {
  addEventListener(EEvent.BEFORE_REQUEST, (event) => {
    if (event instanceof RequestEvent) {
      const { request } = event as RequestEvent;
      const url = `${request.url}`;

      if (!config.noIgnoreCheck && /\/healthz$/.test(url)) {
        return; // ignore status request, usually called by healthcheck
      }

      if (config.ignorePatterns) {
        for (let pattern of config.ignorePatterns) {
          if (pattern.test(url)) {
            return; // ignore custom requests
          }
        }
      }

      const log = [
        config?.title ?? "Access",
        (new Date()).toISOString(),
        request.method,
        request.url,
        request.headers.get("user-agent"),
      ];

      config.log(log.join(" "));
    }
  });
}
