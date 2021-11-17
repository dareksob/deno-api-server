import { Route } from "../../services/route.ts";
import { EMethod } from "../../definition/method.ts";

/**
 * preset healthcheck endpoint
 */
export default () => new Route([EMethod.HEAD, EMethod.GET], "/healthz");
