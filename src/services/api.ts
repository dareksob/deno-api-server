import { IServerConfig } from "../definition/server-config.ts";
import { serve, Server, ServerRequest } from "../deps.ts";
import { Route } from "./route.ts";

export class Api {
    protected server: Server | null = null;
    protected routes: Route[] = [];
    protected serverConfig: IServerConfig;

    constructor(serverConfig: IServerConfig) {
        this.serverConfig = serverConfig;
    }

    /**
     * Add route to server stack
     * @param route
     */
    public addRoute(route: Route) : Api {
        this.routes.push(route);
        return this;
    }

    public getRouteByRequest(request: ServerRequest) : null | Route {
        for (let route of this.routes) {
            if (route.method.includes(request.method)) {
                if (route.uri.test(request.url)) {
                    return route;
                }
            }
        }
        return null;
    }

    public async listen() {
        this.server = serve(this.serverConfig);

        for await (const request of this.server) {
            const route = this.getRouteByRequest(request);

            try {
                if (route) {
                    await route.execute(request);
                } else {
                    request.respond({ status: 404 });
                }
            } catch (e) {
                request.respond({ status: 500, body: e.message });
            }
        }
    }
}