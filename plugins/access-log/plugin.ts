import {Api, EEvent, RequestEvent} from "../../mod.ts";

interface IConfig {
  log: (...data: any[]) => void,
  noIgnoreCheck?: boolean,
  ignorePatterns?: RegExp[]
  title?: string | false,
  noTimestamp?: boolean
}

/**
 * @example plugin(api, { log: console.log })
 * @param api
 * @param config
 */
export default function plugin(api: Api, config: IConfig) {
  const label: string[] = [];

  if (typeof config.title === 'string') {
    label.push(config.title);
  }

  addEventListener(EEvent.BEFORE_REQUEST, (event) => {
    if (event instanceof RequestEvent) {
      const {request} = event as RequestEvent;
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

      const log: string[] = [];

      if (config?.title !== false) {
        log.push(config.title ? config.title : 'Access');
      }

      if (!config.noTimestamp) {
        log.push((new Date()).toISOString());
      }

      config.log([
        ...log,
        request.method,
        request.url,
        request.headers.get("user-agent")
      ].join(" ").trim());
    }
  });
}
