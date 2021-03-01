import {Api} from '../services/api.ts';
import {IContext, IRequest, IRoute, IServerConfig} from "../definition/types.ts";
import {mockResponse} from "./mock-response.ts";
import {RequestError} from "../errors/request.error.ts";
import {mockRequest} from "../dev_mod.ts";

export class MockApi extends Api {
    static readonly HOST = 'http://localhost';
    public lastRoute?: IRoute | null;
    public lastContext?: IContext | null;

    constructor(serverConfig: IServerConfig) {
        super(serverConfig);
    }

    public sendByArguments(method: string, uri: string | URL) {
        const pathname = uri instanceof URL ? uri.pathname : `uri`;
        const request = mockRequest(method, pathname);
        return this.sendByRequest(request);
    }

    public async sendByRequest(request: IRequest, url?: URL) {
        url = url instanceof URL ? url : new URL(request.url, MockApi.HOST);

        const response = mockResponse();
        const route = this.getRouteByRequest(request, url);
        this.lastRoute = route;

        if (route) {
            this.lastContext = await route.execute(url, request, response);
        } else {
            throw new RequestError('Not found', 404);
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