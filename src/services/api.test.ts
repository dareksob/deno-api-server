import { assertEquals } from '../dev_deps.ts';
import { Api } from './api.ts';
import { Route } from './route.ts'; 
import { mockRequest } from '../dev_mod.ts';

Deno.test('Api should be constructable', () => {
    const api = new Api({ port: 80 });
    assertEquals(true, api instanceof Api);
});

Deno.test('Api should get route by match', () => {
    const api = new Api({ port: 80 });

    const testRoute = new Route('GET', '/test');
    api.addRoute(testRoute);

    // should be functional
    assertEquals('function', typeof api.getRouteByRequest);

    // should be get route
    assertEquals(testRoute, api.getRouteByRequest(
        mockRequest('GET', '/test')
    ));
});