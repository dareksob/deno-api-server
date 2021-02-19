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

    const testRoute2 = new Route('POST', /^\/get\/([0-9]+)/);
    assertEquals(
        api, 
        api.addRoute(testRoute2)
    );

    // should be functional
    assertEquals('function', typeof api.getRouteByRequest);

    // should be get route
    assertEquals(testRoute, api.getRouteByRequest(
        mockRequest('GET', '/test')
    ));

    // resolve by regexp
    assertEquals(testRoute2, api.getRouteByRequest(
        mockRequest('POST', '/get/122')
    ));

    // resolve null
    assertEquals(null, api.getRouteByRequest(
        mockRequest('PATCH', '/get/2323')
    ));
    
});