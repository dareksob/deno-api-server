import { assertEquals } from '../dev_deps.ts';
import { Api } from './api.ts';
import { Route } from './route.ts'; 
import {mockRequest, mockResponse, mockApi, MockApi } from '../dev_mod.ts';
import {IResponse} from "../definition/types.ts";

Deno.test('Api should be constructable', () => {
    const api = new Api({ port: 80 });
    assertEquals(api instanceof Api, true);
    assertEquals(api.serverConfig.port, 80);
    assertEquals(api.serverConfig.hostname, undefined);
});

Deno.test('Api should get route by match', () => {
    const api = new Api({ port: 8080 });
    assertEquals(api.serverConfig.port, 8080);

    const testRoute = new Route('GET', '/test');
    api.addRoute(testRoute);

    // should be functional
    assertEquals('function', typeof api.getRouteByRequest);

    // should be get route
    assertEquals(testRoute, api.getRouteByRequest(
        mockRequest('GET', '/test')
    ));
});


Deno.test('Api should handleError', () => {
    class UnitApi extends MockApi {
        public execHandleError(response: IResponse, error: Error) {
            this.handleError(response, error);
        }
    }
    const api = new UnitApi({ port: 80 });
    const response : IResponse = mockResponse();

    api.execHandleError(response, new Error('any'));
    assertEquals(response.status, 500);
    assertEquals(response.body, { message: 'any' });


    const response2 : IResponse = mockResponse();
    api.execHandleError(response, new Request('any'));
    assertEquals(response.status, 500);
    assertEquals(response.body, { message: 'any' });
});