import {Api} from '../services/api.ts';
import {
    IContext, IInjections,
    IRequest,
    IResponse,
    IRoute,
    IServerConfig,
} from "../definition/types.ts";
import {mockResponse} from "./mock-response.ts";
import {RequestError} from "../errors/request.error.ts";
import {mockRequest} from "../../dev_mod.ts";

interface IErrorContext {
    url: URL,
    request: IRequest
    response: IResponse,
}

export class MockApi extends Api {
    static readonly HOST = 'http://localhost';
    public lastRoute?: IRoute | null;
    public lastContext?: IContext | IErrorContext | null;

    private injections : IInjections = {};

    constructor(serverConfig: IServerConfig) {
        super(serverConfig);
    }

    public mockInjections(injectsions: IInjections) : MockApi {
        this.injections = injectsions;
        return this;
    }

    /**
     * shorthand function
     *
     * @param method
     * @param uri
     * @param data
     */
    public sendByArguments(method: string, uri: string | URL, data: any = undefined) {
        const pathname = uri instanceof URL ? uri.pathname : `${uri}`;
        const request = mockRequest(method, pathname, data);
        return this.sendByRequest(request);
    }

    /**
     * request send method
     *
     * @param request
     * @param url
     */
    public async sendByRequest(request: IRequest, url?: URL) {
        url = url instanceof URL ? url : new URL(request.url, MockApi.HOST);

        const response = mockResponse();
        const route = this.getRouteByRequest(request, url);
        this.lastRoute = route;

        try {
            if (route) {
                const currentInjections = { ...route.di };
                Object.assign(route.di, this.injections);

                this.lastContext = await route.execute(url, request, response);

                route.di = currentInjections;

            } else {
                throw new RequestError('Not found', 404);
            }
        } catch (e) {
            this.handleError(response, e);
            this.lastContext = {
                error: e,
                url,
                request,
                response,
            }
        }
    }
}

export default function mockApi(route?: IRoute): MockApi {
    const api = new MockApi({port: 80});
    if (route) {
        api.addRoute(route);
    }
    return api;
}