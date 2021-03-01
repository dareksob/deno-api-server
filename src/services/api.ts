import {IServerConfig, IResponse, IRoute, IStateMap} from "../definition/types.ts";
import { serve, Server, ServerRequest } from "../deps.ts";
import { RequestError } from "../errors/request.error.ts";
import {EEvent} from "../definition/event.ts";
import RouteEvent from "../definition/events/route.event.ts";

export class Api {
    protected server: Server | null = null;
    protected routes: IRoute[] = [];

    public serverConfig: IServerConfig;
    public forceJsonResponse = true;
    public readonly props : IStateMap = new Map();

    constructor(serverConfig: IServerConfig) {
        this.serverConfig = serverConfig;
    }

    get host() {
        const hostname = this.serverConfig.hostname || 'localhost';
        const port = this.serverConfig.port || 80;
        return `http://${hostname}:${port}`;
    }

    /**
     * Add route to server stack
     * @param route
     */
    public addRoute(route: IRoute) : Api {
        route.parent = this;

        dispatchEvent(new RouteEvent(EEvent.API_ADD_ROUTE, route));

        this.routes.push(route);
        return this;
    }


    getUrlByRequest(request: ServerRequest) : URL {
        return new URL(request.url, this.host);
    }

    /**
     * resolve route by request
     * 
     * @param request 
     * @param {URL|null} url
     */
    public getRouteByRequest(request: ServerRequest, url?: URL) : null | IRoute {
        url = url || this.getUrlByRequest(request);

        for (let route of this.routes) {
            if (route.methods.includes(request.method)) {
                if (route.isMatch(url)) {
                    return route;
                }
            }
        }
        return null;
    }

    /**
     * start server listing on requests
     */
    public async listen() {
        this.server = serve(this.serverConfig);

        for await (const request of this.server) {
            const url = this.getUrlByRequest(request);
            const response : IResponse = {
                status: 200,
                headers: new Headers()
            };

            try {
                const route = this.getRouteByRequest(request, url);

                if (route) {
                    await route.execute(url, request, response);
                } else {
                    response.status = 404;
                }
                
            } catch (e) {
                this.handleError(response, e);
            }
            
            try {
                // transform to json
                if (response.body && typeof response.body !== 'string') {
                    // @ts-ignore
                    response.headers.set('Content-Type', 'application/json');
                    response.body = JSON.stringify(response.body);
                }

                request.respond(response);
            } catch(e) {
                request.respond({ 
                    status: 500, 
                    body: e.message
                });
            }
        }
    }

    protected handleError(response: IResponse, error: Error) {
        let body = response.body;
        let message : string | Object = error.message;

        if (this.forceJsonResponse) {
            message = { message };
        }

        if (error instanceof RequestError) {
            response.status = error.status;

        } else {
            response.status = 500;
        }

        if ( typeof body === 'object') {
            Object.assign(body, typeof message === 'object' ? message : { message });
        } else {
            body = message;
        }

        response.body = body;
    }
}