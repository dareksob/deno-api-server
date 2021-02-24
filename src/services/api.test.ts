import { assertEquals } from '../dev_deps.ts';
import { Api } from './api.ts';
import { Route } from './route.ts'; 
import { mockRequest } from '../dev_mod.ts';

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