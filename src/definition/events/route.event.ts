import { IRoute } from "../types.ts";

export default class RouteEvent extends Event {
  public route: IRoute;

  constructor(type: string, route: IRoute) {
    super(type);
    this.route = route;
  }
}
